'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Home, Play, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface SubscriptionData {
  sessionId: string
  planId: string
  planName: string
  amount: number
  status: string
}

function ExitoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('No se encontró información de la sesión')
      setLoading(false)
      return
    }

    verifyPayment(sessionId)
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      // Verificar el pago con Stripe
      const response = await fetch(`/api/stripe/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar el pago')
      }

      setSubscription(data)

      // Guardar suscripción en la base de datos
      await saveSubscription(data)
      
      // Verificar si el usuario está autenticado
      const { data: { user } } = await supabase.auth.getUser()
      
      // Si el usuario está autenticado y el pago fue exitoso, redirigir al login después de 30 segundos
      if (user && data.status === 'paid') {
        setTimeout(() => {
          router.push('/auth/login?message=payment_success')
        }, 30000)
      }

    } catch (error) {
      console.error('Error verifying payment:', error)
      setError('Error al verificar el pago')
    } finally {
      setLoading(false)
    }
  }

  const mapPlanToType = (planName: string): string => {
    const name = planName.toLowerCase()
    if (name.includes('basico') || name.includes('basic')) return 'basico'
    if (name.includes('estandar') || name.includes('standard')) return 'estandar'
    if (name.includes('premium')) return 'premium'
    // Fallback por defecto
    return 'basico'
  }

  const saveSubscription = async (subscriptionData: SubscriptionData) => {
    try {
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error obteniendo usuario:', userError)
        return
      }

      // Mapear el planName a un tipo válido
      const tipoSuscripcion = mapPlanToType(subscriptionData.planName || subscriptionData.planId)
      
      console.log('Creando suscripción:', {
        planId: subscriptionData.planId,
        planName: subscriptionData.planName,
        tipoCalculado: tipoSuscripcion
      })

      // Usar el endpoint de API en lugar de insert directo
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cuentaId: user.id,
          tipo: tipoSuscripcion, // Usar el tipo mapeado correctamente
          planId: subscriptionData.planId,
          stripeSubscriptionId: subscriptionData.sessionId, // Usar sessionId por ahora
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error guardando suscripción via API:', errorData)
      } else {
        const result = await response.json()
        console.log('Suscripción guardada exitosamente:', result)
      }
    } catch (error) {
      console.error('Error saving subscription:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="text-2xl font-bold text-red-600">
              WatchHub
            </Link>
          </div>
        </div>

        <div className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-gray-800/50 border-red-500/30">
              <CardContent className="p-8">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-white mb-4">
                  Error en el Pago
                </h1>
                <p className="text-gray-400 mb-8">{error}</p>
                
                <div className="space-y-4">
                  <Button
                    onClick={() => router.push('/suscripciones')}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Intentar de Nuevo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Volver al Inicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-red-600">
            WatchHub
          </Link>
        </div>
      </div>

      <div className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gray-800/50 border-green-500/30">
            <CardContent className="p-8">
              {/* Icono de éxito */}
              <div className="bg-green-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">
                ¡Pago Exitoso!
              </h1>
              
              <p className="text-gray-400 mb-8">
                Tu suscripción ha sido activada correctamente. 
                Ahora completa tu registro para empezar a disfrutar.
              </p>

              {subscription && (
                <div className="bg-gray-700/50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Detalles de tu Suscripción
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plan:</span>
                      <span className="text-white font-medium">{subscription.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monto:</span>
                      <span className="text-white font-medium">${subscription.amount} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span className="text-green-400 font-medium">Activa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Renovación:</span>
                      <span className="text-white font-medium">Mensual</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Beneficios */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">
                  Tu suscripción está lista, ¡solo falta registrarte!
                </h3>
                <div className="space-y-2 text-sm text-blue-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Suscripción pagada y activada</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Acceso completo al catálogo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Streaming en alta calidad</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Sin anuncios</span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/auth/register?subscription=paid')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Completar Registro
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Inicio
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Recibirás un email de confirmación con los detalles de tu suscripción.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ExitoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <ExitoContent />
    </Suspense>
  )
}
