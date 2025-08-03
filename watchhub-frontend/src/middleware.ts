import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import adminRouteMiddleware from './middleware/admin-route'

export async function middleware(req: NextRequest) {
  // Verificar si la ruta es del panel de administrador
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return await adminRouteMiddleware(req)
  }

  // Para otras rutas, continuar normalmente
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
