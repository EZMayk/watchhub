import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { MiddlewareContext, MiddlewareResult, UserAccount } from './types'

/**
 * Middleware específico para rutas de administrador
 * Verifica que el usuario tenga rol de admin
 */
export async function adminMiddleware(context: MiddlewareContext): Promise<MiddlewareResult> {
  if (!context.session) {
    return {
      redirect: new URL('/auth/login', context.req.url).toString(),
      error: 'authentication_required'
    }
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: context.req, res })

  try {
    // Verificar el rol del usuario en la tabla cuentas
    const { data: userAccount, error } = await supabase
      .from('cuentas')
      .select('rol')
      .eq('id', context.session.user.id)
      .single()

    // Si hay error o el usuario no es admin, redirigir al home
    if (error || !userAccount || userAccount.rol !== 'admin') {
      const redirectUrl = new URL('/', context.req.url)
      redirectUrl.searchParams.set('error', 'access_denied')
      return {
        redirect: redirectUrl.toString(),
        error: 'access_denied'
      }
    }

    return { continue: true }
  } catch (error) {
    console.error('Error in admin middleware:', error)
    const redirectUrl = new URL('/', context.req.url)
    redirectUrl.searchParams.set('error', 'server_error')
    return {
      redirect: redirectUrl.toString(),
      error: 'server_error'
    }
  }
}

/**
 * Verifica si el usuario tiene permisos de administrador
 */
export function requireAdmin(userAccount: UserAccount | null): boolean {
  return userAccount?.rol === 'admin'
}
