No such customer: 'cus_SpJSTy4AAr3rrM''use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import Link from 'next/link'

function PayPalSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const orderId = searchParams.get('token') // PayPal usa 'token' para el order ID
    const payerId = searchParams.get('PayerID')

    if (!orderId) {
      setStatus('error')
      setMessage('Información de orden no válida')
      return
    }

    capturePayment(orderId)
  }, [searchParams])

  const capturePayment = async (orderId: string) => {
    try {
      const response = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage('¡Pago procesado exitosamente! Tu suscripción está activa.')
        
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          router.push('/pages/dashboard-user')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Error al procesar el pago')
      }
    } catch (error) {
      console.error('Error capturing PayPal payment:', error)
      setStatus('error')
      setMessage('Error interno al procesar el pago')
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
                    Procesando tu pago
                  </h1>
                  <p className="text-gray-400 mb-6">
                    Por favor, espera mientras confirmamos tu pago con PayPal...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <h1 className="text-2xl font-bold text-white mb-4">
                    ¡Pago Exitoso!
                  </h1>
                  <p className="text-gray-400 mb-6">
                    {message}
                  </p>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                    <p className="text-green-300 text-sm">
                      Tu método de pago de PayPal se ha guardado para futuras compras.
                      Serás redirigido a tu dashboard en un momento...
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
                    {message}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => router.push('/suscripciones')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Intentar de nuevo
                    </Button>
                    <Button
                      onClick={() => router.push('/')}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Volver al inicio
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PayPalSuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      }
    >
      <PayPalSuccessContent />
    </Suspense>
  )
}
