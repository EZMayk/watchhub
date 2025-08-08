import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/suscripciones'

  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (!error) {
        // Email confirmado exitosamente, redirigir a la página de planes
        const redirectUrl = new URL('/suscripciones', request.url)
        redirectUrl.searchParams.set('message', 'email_confirmed')
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('Error confirmando email:', error)
    }
  }

  // Si hay error o falla la confirmación, redirigir a login con error
  const errorUrl = new URL('/auth/login', request.url)
  errorUrl.searchParams.set('error', 'email_confirmation_failed')
  return NextResponse.redirect(errorUrl)
}
