import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { 
      planId, 
      planName, 
      planType, 
      planPrice, 
      paymentMethodId 
    } = await request.json()

    // Validaciones básicas
    if (!planId || !paymentMethodId || !planPrice) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: planId, paymentMethodId, planPrice' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabaseServer = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Verificar usuario autenticado
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Obtener datos del usuario
    const { data: userData, error: userError } = await supabaseServer
      .from('cuentas')
      .select('stripe_customer_id, correo')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Usuario no configurado para pagos' },
        { status: 404 }
      )
    }

    // Verificar que el método de pago pertenece al customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    
    if (paymentMethod.customer !== userData.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Método de pago no válido para este usuario' },
        { status: 403 }
      )
    }

    // Crear price product primero para la suscripción
    const stripePrice = await stripe.prices.create({
      currency: 'usd',
      product_data: {
        name: `WatchHub - ${planName}`,
      },
      unit_amount: Math.round(planPrice * 100),
      recurring: {
        interval: 'month',
      },
    })

    // Crear suscripción con el price creado
    const subscription = await stripe.subscriptions.create({
      customer: userData.stripe_customer_id,
      items: [
        {
          price: stripePrice.id,
        },
      ],
      default_payment_method: paymentMethodId,
      metadata: {
        planId,
        planName,
        planType: planType || '',
        userId: user.id,
      },
      // Expandir para obtener detalles del último invoice
      expand: ['latest_invoice.payment_intent'],
    })

    // Verificar el estado de la suscripción
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice & {
      payment_intent?: Stripe.PaymentIntent
    }
    const paymentIntent = latestInvoice?.payment_intent

    let clientSecret = null
    let requiresAction = false

    if (paymentIntent) {
      if (paymentIntent.status === 'requires_action') {
        requiresAction = true
        clientSecret = paymentIntent.client_secret
      } else if (paymentIntent.status === 'succeeded') {
        // Pago exitoso - la suscripción está activa
        console.log('Suscripción creada exitosamente:', subscription.id)
      } else if (paymentIntent.status === 'requires_payment_method') {
        // El método de pago falló
        return NextResponse.json(
          { error: 'Error en el método de pago. Por favor, verifica tus datos.' },
          { status: 402 }
        )
      }
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
      requiresAction,
      message: requiresAction 
        ? 'Se requiere autenticación adicional'
        : 'Suscripción activada correctamente'
    })

  } catch (error) {
    console.error('Error en pago rápido:', error)
    
    // Manejo específico de errores de Stripe
    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'card_declined') {
        return NextResponse.json(
          { error: 'Tarjeta declinada. Por favor, verifica tus datos o usa otro método de pago.' },
          { status: 402 }
        )
      } else if (error.code === 'insufficient_funds') {
        return NextResponse.json(
          { error: 'Fondos insuficientes en la tarjeta.' },
          { status: 402 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
