import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { MiddlewareResult } from './types'

/**
 * Ejecuta middlewares en secuencia y maneja los resultados
 */
export async function runMiddleware(
  req: NextRequest,
  middlewares: Array<(context: any) => Promise<MiddlewareResult> | MiddlewareResult>
): Promise<NextResponse> {
  let context = { req }
  
  for (const middleware of middlewares) {
    const result = await middleware(context)
    
    if (result.redirect) {
      return NextResponse.redirect(result.redirect)
    }
    
    if (!result.continue) {
      // Si no continúa y no hay redirect, continuar con la request
      break
    }
    
    // Actualizar contexto si es necesario
    if (result.continue && typeof result === 'object') {
      context = { ...context, ...result }
    }
  }
  
  return NextResponse.next()
}

/**
 * Combina múltiples middlewares en uno solo
 */
export function combineMiddlewares(
  ...middlewares: Array<(context: any) => Promise<MiddlewareResult> | MiddlewareResult>
) {
  return async (req: NextRequest) => {
    return runMiddleware(req, middlewares)
  }
}

/**
 * Crea un middleware condicional basado en una ruta
 */
export function createRouteMiddleware(
  pathPattern: string | RegExp,
  middleware: (context: any) => Promise<MiddlewareResult> | MiddlewareResult
) {
  return async (context: any) => {
    const { req } = context
    const pathname = req.nextUrl.pathname
    
    const matches = typeof pathPattern === 'string' 
      ? pathname.startsWith(pathPattern)
      : pathPattern.test(pathname)
    
    if (matches) {
      return await middleware(context)
    }
    
    return { continue: true }
  }
}
