import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import adminRouteMiddleware from './middleware/admin-route'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  // Verificar si la ruta es del panel de administrador
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return await adminRouteMiddleware(req)
  }

  // Rutas que requieren suscripción activa
  const subscriptionRequiredPaths = [
    '/pages/dashboard-user',
    '/pages/principal'
  ]

  const requiresSubscription = subscriptionRequiredPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (requiresSubscription) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        const loginUrl = new URL('/auth/login', req.url)
        loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Verificar si el usuario es admin (los admins no necesitan suscripción)
      const { data: userAccount } = await supabase
        .from('cuentas')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (userAccount?.rol === 'admin') {
        return res
      }

      // Verificar si el usuario tiene una suscripción activa
      const { data: subscription, error: subError } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('cuenta_id', user.id)
        .eq('activa', true)
        .gt('expira_en', new Date().toISOString())
        .single()

      if (subError || !subscription) {
        // Si no tiene suscripción activa, redirigir a suscripciones
        const subscriptionUrl = new URL('/suscripciones', req.url)
        subscriptionUrl.searchParams.set('message', 'subscription_required')
        return NextResponse.redirect(subscriptionUrl)
      }

      return res
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  // Para otras rutas, continuar normalmente
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/pages/dashboard-user/:path*']
}
