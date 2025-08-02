import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar si la ruta es del panel de administrador
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Si no hay sesión, redirigir al login
    if (!session) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Verificar el rol del usuario en la tabla cuentas
    const { data: userAccount, error } = await supabase
      .from('cuentas')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    // Si hay error o el usuario no es admin, redirigir al home
    if (error || !userAccount || userAccount.rol !== 'admin') {
      const redirectUrl = new URL('/', req.url)
      redirectUrl.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
