import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { MiddlewareContext, MiddlewareResult } from './types'

/**
 * Middleware de autenticación básica
 * Verifica si el usuario tiene una sesión válida
 */
export async function authMiddleware(req: NextRequest): Promise<MiddlewareContext> {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Obtener la sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return {
    req,
    session
  }
}

/**
 * Verifica si hay una sesión activa
 */
export function requireAuth(context: MiddlewareContext): MiddlewareResult {
  if (!context.session) {
    const redirectUrl = new URL('/auth/login', context.req.url)
    redirectUrl.searchParams.set('redirectTo', context.req.nextUrl.pathname)
    return {
      redirect: redirectUrl.toString()
    }
  }

  return { continue: true }
}
