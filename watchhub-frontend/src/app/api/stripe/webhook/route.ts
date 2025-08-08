import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log('Stripe webhook received')
  
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('No stripe-signature header found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Processing webhook event:', event.type)

    // Usar service role client para operaciones con privilegios elevados
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const customerId = session.customer as string
          
          // Buscar el usuario por customer ID
          const { data: usuario, error: userError } = await supabase
            .from('cuentas')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (userError || !usuario) {
            console.error('User not found for customer:', customerId, userError)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
          }

          // Obtener información del plan desde los metadatos
          const planId = session.metadata?.planId
          const planName = session.metadata?.planName || 'Plan Básico'
          const planType = session.metadata?.planType || 'basico'

          if (!planId) {
            console.error('Plan ID not found in session metadata')
            return NextResponse.json({ error: 'Plan ID not found' }, { status: 400 })
          }

          // Mapear el planType a un tipo válido
          const mapPlanToType = (planName: string): string => {
            const name = planName.toLowerCase()
            if (name.includes('basico') || name.includes('basic')) return 'basico'
            if (name.includes('estandar') || name.includes('standard')) return 'estandar'
            if (name.includes('premium')) return 'premium'
            return 'basico' // Fallback por defecto
          }

          const tipoSuscripcion = mapPlanToType(planType || planName)

          // Calcular fecha de expiración
          const now = new Date()
          const expiraEn = new Date((subscription as any).current_period_end * 1000)

          // Desactivar suscripciones previas
          await supabase
            .from('suscripciones')
            .update({ activa: false })
            .eq('cuenta_id', usuario.id)

          // Crear nueva suscripción
          const { data: newSubscription, error: insertError } = await supabase
            .from('suscripciones')
            .insert({
              cuenta_id: usuario.id,
              tipo: tipoSuscripcion, // Usar el tipo mapeado
              plan_id: planId,
              activa: true,
              iniciada_en: now.toISOString(),
              expira_en: expiraEn.toISOString(),
              stripe_subscription_id: subscription.id,
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error creating subscription:', insertError)
            return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
          }

          console.log('Subscription created via webhook:', newSubscription)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscription.id)

        // Actualizar suscripción existente
        const { error: updateError } = await supabase
          .from('suscripciones')
          .update({
            activa: subscription.status === 'active',
            expira_en: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', subscription.id)

        // Desactivar suscripción
        const { error: cancelError } = await supabase
          .from('suscripciones')
          .update({ activa: false })
          .eq('stripe_subscription_id', subscription.id)

        if (cancelError) {
          console.error('Error cancelling subscription:', cancelError)
        }
        break
      }

      default:
        console.log('Unhandled webhook event:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
