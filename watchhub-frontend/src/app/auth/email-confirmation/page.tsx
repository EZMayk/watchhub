'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Mail, CheckCircle, AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react'
import { Button, Card, CardContent, Alert } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function EmailConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const resendConfirmationEmail = async () => {
    if (!email) {
      setError('No se encontró el correo electrónico')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (resendError) {
        throw resendError
      }

      setMessage('Correo de confirmación reenviado exitosamente. Revisa tu bandeja de entrada.')
    } catch (err) {
      console.error('Error reenviando correo:', err)
      setError(err instanceof Error ? err.message : 'Error al reenviar el correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Botón volver */}
        <div className="mb-6">
          <Link href="/auth/register">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al registro
            </Button>
          </Link>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Icono y encabezado */}
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-blue-600/20 rounded-full mb-4">
                <Mail className="w-12 h-12 text-blue-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                Confirma tu correo electrónico
              </h1>
              
              <p className="text-gray-300 text-sm">
                Tu cuenta ha sido creada exitosamente
              </p>
            </div>

            {/* Mensaje principal */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">
                    Enviamos un enlace de confirmación a:
                  </p>
                  <p className="text-blue-100 font-semibold break-all">
                    {email || 'tu correo electrónico'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-300 text-sm text-center">
                Toca en el enlace del email para terminar de configurar tu cuenta y poder elegir tu plan de suscripción.
              </p>
              
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-200 text-xs">
                  <strong>Revisa tu carpeta de spam</strong> si no ves el correo en tu bandeja de entrada.
                </p>
              </div>
            </div>

            {/* Mostrar mensajes */}
            {message && (
              <Alert variant="success" className="mb-4">
                {message}
              </Alert>
            )}

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Botón reenviar */}
            <div className="space-y-4">
              <Button
                onClick={resendConfirmationEmail}
                disabled={loading || !email}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {loading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reenviar correo de confirmación
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-gray-400 text-xs mb-2">
                  ¿Ya confirmaste tu correo?
                </p>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="space-y-3 text-xs text-gray-400">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold">1.</span>
                  <span>Abre tu correo electrónico</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold">2.</span>
                  <span>Busca el email de WatchHub</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold">3.</span>
                  <span>Haz clic en "Confirmar correo electrónico"</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold">4.</span>
                  <span>Serás redirigido para elegir tu plan</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            ¿Necesitas ayuda? Contacta a nuestro{' '}
            <Link href="/contacto" className="text-blue-400 hover:text-blue-300">
              equipo de soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <EmailConfirmationContent />
    </Suspense>
  )
}
