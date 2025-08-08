import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de orden requerido' },
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

    // Obtener token de acceso de PayPal
    const accessToken = await getPayPalAccessToken()

    // Capturar el pago en PayPal
    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await captureResponse.json()

    if (!captureResponse.ok) {
      console.error('Error capturando pago PayPal:', captureData)
      return NextResponse.json(
        { error: 'Error al procesar el pago' },
        { status: 400 }
      )
    }

    // Verificar que el pago fue exitoso
    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'El pago no se completó correctamente' },
        { status: 400 }
      )
    }

    // Obtener información del pagador para guardar método de pago
    const payerInfo = captureData.payer
    const payerEmail = payerInfo?.email_address
    const payerId = payerInfo?.payer_id

    if (payerId && payerEmail) {
      // Guardar o actualizar método de pago de PayPal
      await supabaseServer
        .from('paypal_payment_methods')
        .upsert({
          user_id: user.id,
          paypal_payer_id: payerId,
          paypal_email: payerEmail,
          status: 'active',
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,paypal_payer_id'
        })
    }

    // Actualizar la orden en la base de datos
    await supabaseServer
      .from('paypal_orders')
      .update({
        status: 'completed',
        paypal_data: captureData,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('user_id', user.id)

    // Crear la suscripción en la base de datos
    const { data: orderData } = await supabaseServer
      .from('paypal_orders')
      .select('plan_id, plan_name, amount')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderData) {
      // Crear la suscripción usando el endpoint dedicado
      try {
        // Mapear el plan_name a un tipo válido
        const mapPlanToType = (planName: string): string => {
          const name = planName?.toLowerCase() || ''
          if (name.includes('basico') || name.includes('basic')) return 'basico'
          if (name.includes('estandar') || name.includes('standard')) return 'estandar'
          if (name.includes('premium')) return 'premium'
          return 'basico' // Fallback por defecto
        }

        const tipoSuscripcion = mapPlanToType(orderData.plan_name || '')
        
        console.log('Creating subscription via API:', {
          planName: orderData.plan_name,
          tipoCalculado: tipoSuscripcion,
          planId: orderData.plan_id
        })

        const subscriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '', // Pasar las cookies para autenticación
          },
          body: JSON.stringify({
            cuentaId: user.id,
            tipo: tipoSuscripcion, // Usar el tipo mapeado correctamente
            planId: orderData.plan_id,
            paypalSubscriptionId: orderId,
          }),
        })

        if (!subscriptionResponse.ok) {
          const errorData = await subscriptionResponse.json()
          console.error('Error creating subscription via API:', errorData)
          throw new Error(`Failed to create subscription: ${errorData.error}`)
        }

        const subscriptionData = await subscriptionResponse.json()
        console.log('Subscription created successfully:', subscriptionData)
      } catch (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError)
        // No retornamos error aquí porque el pago ya se procesó exitosamente
        // Solo logueamos el error para debug
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pago procesado exitosamente',
      orderId,
      status: captureData.status,
      paymentMethod: payerId ? 'saved' : 'new'
    })

  } catch (error) {
    console.error('Error en PayPal capture:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
