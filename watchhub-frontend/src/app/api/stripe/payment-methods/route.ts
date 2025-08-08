import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

// GET - Obtener métodos de pago guardados del usuario
export async function GET() {
  try {
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

    // Obtener datos del usuario incluyendo stripe_customer_id
    const { data: userData, error: userError } = await supabaseServer
      .from('cuentas')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Usuario no tiene Customer ID de Stripe' },
        { status: 404 }
      )
    }

    // Obtener métodos de pago del customer en Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: userData.stripe_customer_id,
      type: 'card',
    })

    // Formatear datos para el frontend
    const formattedMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year,
      created: pm.created,
    }))

    return NextResponse.json({ 
      paymentMethods: formattedMethods 
    })

  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un método de pago específico
export async function DELETE(request: NextRequest) {
  try {
    const { paymentMethodId } = await request.json()
    
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'ID de método de pago requerido' },
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

    // Obtener stripe_customer_id del usuario
    const { data: userData, error: userError } = await supabaseServer
      .from('cuentas')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Usuario no tiene Customer ID de Stripe' },
        { status: 404 }
      )
    }

    // Verificar que el método de pago pertenece al customer del usuario
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    
    if (paymentMethod.customer !== userData.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Método de pago no pertenece al usuario' },
        { status: 403 }
      )
    }

    // Desvincular el método de pago del customer
    await stripe.paymentMethods.detach(paymentMethodId)

    return NextResponse.json({ 
      success: true,
      message: 'Método de pago eliminado correctamente'
    })

  } catch (error) {
    console.error('Error eliminando método de pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
