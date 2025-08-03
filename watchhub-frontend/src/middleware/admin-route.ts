import type { NextRequest } from 'next/server'
import { authMiddleware } from './auth'
import { adminMiddleware } from './admin'
import { NextResponse } from 'next/server'

/**
 * Middleware compuesto para rutas de administrador
 * Combina autenticación y verificación de rol admin
 */
export default async function adminRouteMiddleware(req: NextRequest) {
  // Paso 1: Verificar autenticación
  const context = await authMiddleware(req)
  
  // Paso 2: Verificar permisos de admin
  const result = await adminMiddleware(context)
  
  // Manejar resultado
  if (result.redirect) {
    return NextResponse.redirect(result.redirect)
  }
  
  return NextResponse.next()
}
