import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requerido' },
        { status: 400 }
      )
    }

    // Obtener detalles de la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription'],
    })

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'El pago no ha sido completado' },
        { status: 400 }
      )
    }

    // Extraer información de la suscripción
    const lineItem = session.line_items?.data[0]
    const amount = lineItem?.amount_total ? lineItem.amount_total / 100 : 0

    return NextResponse.json({
      sessionId,
      planId: session.metadata?.planId || '',
      planName: session.metadata?.planName || '',
      amount,
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      subscriptionId: typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id,
    })
  } catch (error) {
    console.error('Error verifying Stripe session:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
