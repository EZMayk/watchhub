import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Obtener métodos de pago de PayPal guardados del usuario
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

    // Obtener métodos de pago de PayPal del usuario desde la tabla unificada
    const { data: paypalMethods, error: paypalError } = await supabaseServer
      .from('metodos_pago')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('tipo_proveedor', 'paypal')
      .eq('activo', true)
      .order('last_used_at', { ascending: false })

    if (paypalError) {
      console.error('Error obteniendo métodos PayPal:', paypalError)
      return NextResponse.json(
        { error: 'Error al obtener métodos de pago' },
        { status: 500 }
      )
    }

    // Formatear datos para el frontend
    const formattedMethods = (paypalMethods || []).map((method) => ({
      id: method.id,
      type: 'paypal',
      paypal_account_id: method.paypal_account_id,
      paypal_email: method.paypal_email,
      paypal_payer_id: method.paypal_payer_id,
      nickname: method.nickname,
      is_default: method.is_default,
      verificado: method.verificado,
      last_used_at: method.last_used_at,
      created_at: method.created_at,
    }))

    return NextResponse.json({ 
      paymentMethods: formattedMethods 
    })

  } catch (error) {
    console.error('Error obteniendo métodos de pago PayPal:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Agregar un nuevo método de pago de PayPal
export async function POST(request: NextRequest) {
  try {
    const { account_id, email, payer_id, nickname } = await request.json()
    
    if (!account_id || !email) {
      return NextResponse.json(
        { error: 'account_id y email son requeridos' },
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

    // Verificar si ya existe esta cuenta de PayPal para el usuario
    const { data: existing, error: existingError } = await supabaseServer
      .from('metodos_pago')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('tipo_proveedor', 'paypal')
      .eq('paypal_account_id', account_id)
      .eq('activo', true)
      .single()

    if (existing && !existingError) {
      return NextResponse.json(
        { error: 'Esta cuenta de PayPal ya está registrada' },
        { status: 409 }
      )
    }

    // Verificar cuántos métodos de pago tiene el usuario para saber si es el primero
    const { data: userMethods, error: countError } = await supabaseServer
      .from('metodos_pago')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('activo', true)

    if (countError) {
      console.error('Error verificando métodos existentes:', countError)
    }

    const isFirstMethod = !userMethods || userMethods.length === 0

    // Insertar el nuevo método de pago
    const { data: newMethod, error: insertError } = await supabaseServer
      .from('metodos_pago')
      .insert({
        usuario_id: user.id,
        tipo_proveedor: 'paypal',
        paypal_account_id: account_id,
        paypal_email: email,
        paypal_payer_id: payer_id,
        nickname: nickname || `PayPal (${email})`,
        last_four: email.slice(-4),
        brand: 'PayPal',
        tipo_metodo: 'paypal_account',
        verificado: true,
        is_default: isFirstMethod,
        activo: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error agregando método PayPal:', insertError)
      return NextResponse.json(
        { error: 'Error al agregar método de pago' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      paymentMethod: newMethod,
      message: 'Método de pago agregado correctamente'
    })

  } catch (error) {
    console.error('Error agregando método de pago PayPal:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un método de pago de PayPal específico
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

    // Verificar que el método de pago pertenece al usuario y es de PayPal
    const { data: paymentMethod, error: methodError } = await supabaseServer
      .from('metodos_pago')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('usuario_id', user.id)
      .eq('tipo_proveedor', 'paypal')
      .single()

    if (methodError || !paymentMethod) {
      return NextResponse.json(
        { error: 'Método de pago no encontrado' },
        { status: 404 }
      )
    }

    // Marcar como inactivo en lugar de eliminar
    const { error: updateError } = await supabaseServer
      .from('metodos_pago')
      .update({ 
        activo: false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', paymentMethodId)
      .eq('usuario_id', user.id)

    if (updateError) {
      console.error('Error eliminando método PayPal:', updateError)
      return NextResponse.json(
        { error: 'Error al eliminar método de pago' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Método de pago eliminado correctamente'
    })

  } catch (error) {
    console.error('Error eliminando método de pago PayPal:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
