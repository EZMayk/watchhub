import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  console.log('Stripe checkout endpoint called')
  
  try {
    // Verificar que Stripe esté configurado
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe no está configurado correctamente' },
        { status: 500 }
      )
    }

    const { planId, planName, planType, price, savePaymentMethod = true } = await request.json()
    console.log('Request data:', { planId, planName, planType, price })

    // Validar datos
    if (!planId || !planName || !price) {
      console.error('Missing required fields:', { planId, planName, price })
      return NextResponse.json(
        { error: 'Datos de plan incompletos' },
        { status: 400 }
      )
    }

    // Obtener usuario autenticado
    const cookieStore = cookies()
    const supabaseServer = createRouteHandlerClient({ cookies: () => cookieStore })
    
    let user: any = null
    try {
      const { data: { user: authUser } } = await supabaseServer.auth.getUser()
      user = authUser
      console.log('User authenticated:', !!user)
    } catch (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Error de autenticación' },
        { status: 401 }
      )
    }

    let stripeCustomerId: string | undefined
    let customerEmail: string | undefined

    // Si hay usuario logueado, buscar o crear Customer en Stripe
    if (user) {
      try {
        const { data: userData, error: userDataError } = await supabaseServer
          .from('cuentas')
          .select('stripe_customer_id, correo')
          .eq('id', user.id)
          .single()

        if (userDataError) {
          console.error('Error fetching user data:', userDataError)
          return NextResponse.json(
            { error: 'Error obteniendo datos del usuario' },
            { status: 500 }
          )
        }

        customerEmail = userData?.correo
        console.log('User data found:', { hasCustomerId: !!userData?.stripe_customer_id, email: customerEmail })

        if (userData?.stripe_customer_id) {
          // Verificar si el Customer existe en Stripe
          try {
            console.log('Verifying existing customer:', userData.stripe_customer_id)
            await stripe.customers.retrieve(userData.stripe_customer_id)
            stripeCustomerId = userData.stripe_customer_id
            console.log('Existing customer verified:', stripeCustomerId)
          } catch (customerError) {
            console.log('Customer not found in Stripe, creating new one:', customerError)
            // El customer no existe en Stripe, crear uno nuevo
            const customer = await stripe.customers.create({
              email: userData?.correo,
              metadata: {
                supabase_user_id: user.id
              }
            })
          
            stripeCustomerId = customer.id
            console.log('New customer created (replacing invalid):', stripeCustomerId)
          
            // Actualizar el Customer ID en la base de datos
            const { error: updateError } = await supabaseServer
              .from('cuentas')
              .update({ stripe_customer_id: stripeCustomerId })
              .eq('id', user.id)
              
            if (updateError) {
              console.error('Error updating customer ID:', updateError)
            }
          }
        } else {
          // Crear nuevo Customer
          console.log('Creating new Stripe customer...')
          const customer = await stripe.customers.create({
            email: userData?.correo,
            metadata: {
              supabase_user_id: user.id
            }
          })
        
          stripeCustomerId = customer.id
          console.log('New customer created:', stripeCustomerId)
        
          // Guardar Customer ID en la base de datos
          const { error: updateError } = await supabaseServer
            .from('cuentas')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', user.id)
            
          if (updateError) {
            console.error('Error updating customer ID:', updateError)
          }
        }
      } catch (stripeError) {
        console.error('Stripe customer error:', stripeError)
        return NextResponse.json(
          { error: 'Error configurando customer de Stripe' },
          { status: 500 }
        )
      }
    }

    // Crear sesión de checkout
    console.log('Creating checkout session...')
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `WatchHub - ${planName}`,
              description: `Suscripción mensual al ${planName} de WatchHub`,
            },
            unit_amount: Math.round(price * 100), // Stripe usa centavos
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/suscripciones/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/suscripciones/pago?plan=${planId}`,
      metadata: {
        planId,
        planName,
        planType: planType || '',
        userId: user?.id || '',
      },
      subscription_data: {
        metadata: {
          planId,
          planName,
          planType: planType || '',
          userId: user?.id || '',
        },
      },
      allow_promotion_codes: true,
    }

    // Si hay customer, agregarlo a la sesión
    if (stripeCustomerId) {
      sessionConfig.customer = stripeCustomerId
    } else if (customerEmail) {
      // Si no hay customer pero sí email, usar customer_email
      sessionConfig.customer_email = customerEmail
    }
    // Para modo subscription, NO usamos customer_creation
    // Stripe creará automáticamente el customer si no se especifica uno

    console.log('Session config:', { 
      hasCustomer: !!stripeCustomerId, 
      hasEmail: !!customerEmail,
      mode: sessionConfig.mode,
      price: price * 100
    })

    const session = await stripe.checkout.sessions.create(sessionConfig)
    console.log('Session created successfully:', session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    
    let errorMessage = 'Error interno del servidor'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
