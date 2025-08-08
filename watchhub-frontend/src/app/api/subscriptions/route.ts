import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const body = await request.json()
    const { cuentaId, tipo, planId, stripeSubscriptionId, paypalSubscriptionId } = body

    console.log('Creating subscription:', { cuentaId, tipo, planId })

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea el mismo que está creando la suscripción
    if (user.id !== cuentaId) {
      console.error('User ID mismatch:', { userId: user.id, cuentaId })
      return NextResponse.json(
        { error: 'No autorizado para crear esta suscripción' },
        { status: 403 }
      )
    }

    // Validar que el tipo sea uno de los permitidos
    const tiposPermitidos = ['basico', 'estandar', 'premium']
    if (!tiposPermitidos.includes(tipo)) {
      console.error('Tipo de suscripción inválido:', tipo)
      return NextResponse.json(
        { error: `Tipo de suscripción inválido. Debe ser uno de: ${tiposPermitidos.join(', ')}` },
        { status: 400 }
      )
    }

    // Calcular fecha de expiración (1 mes desde ahora)
    const now = new Date()
    const expiraEn = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 días

    // Desactivar suscripciones previas
    const { error: deactivateError } = await supabase
      .from('suscripciones')
      .update({ activa: false })
      .eq('cuenta_id', cuentaId)

    if (deactivateError) {
      console.error('Error deactivating previous subscriptions:', deactivateError)
      // No retornamos error, continuamos con la creación
    }

    // Crear nueva suscripción
    const subscriptionData = {
      cuenta_id: cuentaId,
      tipo: tipo,
      plan_id: planId,
      activa: true,
      iniciada_en: now.toISOString(),
      expira_en: expiraEn.toISOString(),
      stripe_subscription_id: stripeSubscriptionId,
      paypal_subscription_id: paypalSubscriptionId,
    }

    console.log('Inserting subscription data:', subscriptionData)

    const { data: subscription, error: insertError } = await supabase
      .from('suscripciones')
      .insert(subscriptionData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating subscription:', insertError)
      return NextResponse.json(
        { 
          error: 'Error al crear la suscripción',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    console.log('Subscription created successfully:', subscription)

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Suscripción creada exitosamente'
    })

  } catch (error) {
    console.error('Unexpected error creating subscription:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Obtener suscripción activa del usuario
    const { data: subscription, error } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('cuenta_id', user.id)
      .eq('activa', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching subscription:', error)
      return NextResponse.json(
        { error: 'Error al obtener la suscripción' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: subscription || null
    })

  } catch (error) {
    console.error('Unexpected error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
