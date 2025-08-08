'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function ConfirmarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'requires_action'>('loading')
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const clientSecret = searchParams.get('client_secret')
    const subscriptionId = searchParams.get('subscription_id')

    if (!clientSecret) {
      setStatus('error')
      setMessage('Información de pago no válida')
      return
    }

    confirmPaymentIntent(clientSecret, subscriptionId)
  }, [searchParams])

  const confirmPaymentIntent = async (clientSecret: string, subscriptionId: string | null) => {
    try {
      setProcessing(true)
      const stripe = await stripePromise

      if (!stripe) {
        setStatus('error')
        setMessage('Error al cargar el procesador de pagos')
        return
      }

      // Confirmar el payment intent
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret)

      if (error) {
        setStatus('error')
        setMessage(error.message || 'Error procesando el pago')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setStatus('success')
        setMessage('Pago confirmado exitosamente')
        
        // Redirigir a página de éxito después de 2 segundos
        setTimeout(() => {
          router.push(`/suscripciones/exito${subscriptionId ? `?subscription_id=${subscriptionId}` : ''}`)
        }, 2000)
      } else {
        setStatus('error')
        setMessage('El pago no pudo ser confirmado')
      }
    } catch (error) {
      console.error('Error confirmando pago:', error)
      setStatus('error')
      setMessage('Error interno al confirmar el pago')
    } finally {
      setProcessing(false)
    }
  }

  const handleRetry = () => {
    const clientSecret = searchParams.get('client_secret')
    const subscriptionId = searchParams.get('subscription_id')
    
    if (clientSecret) {
      setStatus('loading')
      confirmPaymentIntent(clientSecret, subscriptionId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-red-600">
              WatchHub
            </Link>
            <Link href="/suscripciones">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a planes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
                  <h1 className="text-2xl font-bold text-white mb-4">
                    Confirmando tu pago
                  </h1>
                  <p className="text-gray-400 mb-6">
                    Por favor, espera mientras procesamos tu pago...
                  </p>
                  {processing && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-300 text-sm">
                        Es posible que necesites completar la autenticación con tu banco.
                        No cierres esta ventana.
                      </p>
                    </div>
                  )}
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <h1 className="text-2xl font-bold text-white mb-4">
                    ¡Pago Confirmado!
                  </h1>
                  <p className="text-gray-400 mb-6">
                    Tu suscripción se ha activado correctamente. 
                    Serás redirigido en un momento...
                  </p>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-300 text-sm">
                      {message}
                    </p>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                  <h1 className="text-2xl font-bold text-white mb-4">
                    Error en el pago
                  </h1>
                  <p className="text-gray-400 mb-6">
                    Hubo un problema al confirmar tu pago.
                  </p>
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-red-300 text-sm">
                      {message}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleRetry}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Reintentar
                    </Button>
                    <Button
                      onClick={() => router.push('/suscripciones')}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Volver a planes
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información de ayuda */}
          <div className="mt-8 text-center">
            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Si experimentas problemas con el pago, nuestro equipo de soporte está aquí para ayudarte.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="mailto:soporte@watchhub.com"
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Contactar Soporte
                </a>
                <a 
                  href="/ayuda/pagos"
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Preguntas Frecuentes
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmarPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      }
    >
      <ConfirmarContent />
    </Suspense>
  )
}
