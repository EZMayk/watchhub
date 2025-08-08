'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CreditCard, Shield, ArrowLeft, Loader2, CheckCircle, AlertCircle, Clock, X } from 'lucide-react'
import { Button, Card, CardContent, Badge, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import SavedPaymentMethods from '@/components/SavedPaymentMethods'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

interface Plan {
  id: string
  nombre: string
  titulo: string
  precio_mensual: number
  precio_anual: number
  descuento_anual: number
  descripcion: string
  caracteristicas: string[]
  activo: boolean
  orden: number
}

interface PaymentMethod {
  id: string
  name: string
  icon: any
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'saved',
    name: 'Método Guardado',
    icon: Clock,
    description: 'Usar un método de pago guardado'
  },
  {
    id: 'stripe',
    name: 'Tarjeta de Crédito/Débito',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.555.494l-1.120 7.106a.265.265 0 0 0 .26.307h3.218a.563.563 0 0 0 .555-.494l.45-2.85h1.73c3.684 0 6.556-1.495 7.393-5.817.615-3.176-.068-5.515-1.955-6.66z"/>
      </svg>
    ),
    description: 'Paga con tu cuenta PayPal'
  }
]

function PagoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { 
    paymentMethods: savedMethods, 
    selectedMethod, 
    selectPaymentMethod,
    processQuickPayment,
    loading: paymentMethodsLoading 
  } = usePaymentMethods()
  
  const [plan, setPlan] = useState<Plan | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>('stripe')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)

  // Filtrar métodos de pago según si el usuario tiene métodos guardados
  const availablePaymentMethods = savedMethods.length > 0 
    ? paymentMethods 
    : paymentMethods.filter(method => method.id !== 'saved')

  useEffect(() => {
    const planId = searchParams.get('plan')
    const fromRegister = searchParams.get('from')
    
    if (fromRegister === 'register') {
      setShowWelcomeMessage(true)
    }
    
    if (planId) {
      loadPlan(planId)
    } else {
      // Si no hay plan válido, redirigir a suscripciones
      router.push('/suscripciones')
    }
  }, [searchParams, router])

  const loadPlan = async (planId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('planes')
        .select('*')
        .eq('id', planId)
        .eq('activo', true)
        .single()

      if (error || !data) {
        console.error('Error cargando plan:', error)
        router.push('/suscripciones')
        return
      }

      setPlan({
        ...data,
        caracteristicas: Array.isArray(data.caracteristicas) ? data.caracteristicas : []
      })
    } catch (error) {
      console.error('Error cargando plan:', error)
      router.push('/suscripciones')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!plan || !selectedPayment) return

    setProcessing(true)
    setError('')

    try {
      if (selectedPayment === 'saved') {
        await handleSavedPaymentMethod()
      } else if (selectedPayment === 'stripe') {
        await handleStripePayment()
      } else if (selectedPayment === 'paypal') {
        await handlePayPalPayment()
      }
    } catch (error) {
      console.error('Error en el pago:', error)
      setError('Hubo un error al procesar el pago. Por favor, inténtalo de nuevo.')
    } finally {
      setProcessing(false)
    }
  }

  const handleSavedPaymentMethod = async () => {
    if (!selectedMethod || !plan) {
      setError('Por favor, selecciona un método de pago guardado')
      return
    }

    try {
      const result = await processQuickPayment({
        planId: plan.id,
        planName: plan.titulo,
        planType: plan.nombre,
        planPrice: plan.precio_mensual,
        paymentMethodId: selectedMethod
      })

      if (result.success) {
        if (result.requiresAction && result.clientSecret) {
          // Redirigir para autenticación adicional (3D Secure)
          router.push(`/suscripciones/confirmar?client_secret=${result.clientSecret}&subscription_id=${result.subscriptionId}`)
        } else {
          // Pago exitoso, redirigir a página de éxito
          router.push(`/suscripciones/exito?subscription_id=${result.subscriptionId}`)
        }
      } else {
        setError(result.error || 'Error procesando el pago')
      }
    } catch (error) {
      console.error('Error en pago guardado:', error)
      throw new Error('Error al procesar pago con método guardado')
    }
  }

  const handleStripePayment = async () => {
    try {
      // Crear sesión de checkout con Stripe
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan?.id,
          planName: plan?.titulo,
          planType: plan?.nombre,
          price: plan?.precio_mensual,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error en respuesta de Stripe:', data)
        throw new Error(data.error || 'Error al crear sesión de pago')
      }

      // Redirigir a Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Error detallado en Stripe:', error)
      throw new Error('Error al procesar pago con Stripe')
    }
  }

  const handlePayPalPayment = async () => {
    try {
      // Crear orden de PayPal
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan?.id,
          planName: plan?.titulo,
          planType: plan?.nombre,
          price: plan?.precio_mensual,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error en respuesta de PayPal:', data)
        throw new Error(data.error || 'Error al crear orden de PayPal')
      }

      // Redirigir a PayPal
      window.location.href = data.approvalUrl
    } catch (error) {
      console.error('Error detallado en PayPal:', error)
      throw new Error('Error al procesar pago con PayPal')
    }
  }

  if (loading || !plan) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando información del plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
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
        <div className="max-w-4xl mx-auto">
          {/* Mensaje de bienvenida para usuarios recién registrados */}
          {showWelcomeMessage && (
            <div className="mb-8 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-green-300 font-semibold mb-1">¡Bienvenido a WatchHub!</h3>
                  <p className="text-green-200 text-sm">
                    Tu cuenta ha sido creada exitosamente. Completa tu suscripción para empezar a disfrutar del mejor contenido.
                  </p>
                </div>
                <button
                  onClick={() => setShowWelcomeMessage(false)}
                  className="text-green-400 hover:text-green-300 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <Badge className="bg-red-600/20 text-red-400 border-red-500/20 px-4 py-2 mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Pago Seguro
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">
              Completa tu Suscripción
            </h1>
            <p className="text-gray-400">
              Finaliza el proceso para empezar a disfrutar de WatchHub
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumen del Plan */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Resumen del Plan
                </h2>
                
                <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {plan.titulo}
                      </h3>
                      <p className="text-gray-400 text-sm">{plan.descripcion}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        ${plan.precio_mensual}
                      </div>
                      <div className="text-gray-400 text-sm">por mes</div>
                      {plan.descuento_anual > 0 && (
                        <div className="text-green-400 text-xs mt-1">
                          Ahorra {plan.descuento_anual}% anual
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.caracteristicas.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total mensual:</span>
                    <span className="text-xl font-bold text-white">
                      ${plan.precio_mensual} USD
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Impuestos incluidos según tu ubicación
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de Pago */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Método de Pago
                </h2>

                {error && (
                  <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Métodos de Pago */}
                <div className="space-y-3 mb-6">
                  {availablePaymentMethods.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedPayment === method.id
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`w-6 h-6 ${
                            selectedPayment === method.id ? 'text-red-400' : 'text-gray-400'
                          }`} />
                          <div className="text-left">
                            <div className={`font-medium ${
                              selectedPayment === method.id ? 'text-white' : 'text-gray-300'
                            }`}>
                              {method.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Métodos de Pago Guardados - Solo cuando se selecciona "saved" */}
                {selectedPayment === 'saved' && user && (
                  <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <SavedPaymentMethods
                      onSelectPaymentMethod={selectPaymentMethod}
                      showSelection={true}
                    />
                  </div>
                )}

                {/* Información de Seguridad */}
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">Pago 100% Seguro</span>
                  </div>
                  <p className="text-green-200 text-sm">
                    Tu información está protegida con encriptación SSL de 256 bits.
                    No almacenamos datos de tarjetas de crédito.
                  </p>
                </div>

                {/* Botón de Pago */}
                <Button
                  onClick={handlePayment}
                  disabled={processing || !selectedPayment || (selectedPayment === 'saved' && !selectedMethod)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      {selectedPayment === 'saved' 
                        ? `Pagar ${plan.precio_mensual} con método guardado`
                        : `Pagar $${plan.precio_mensual} - ${plan.titulo}`
                      }
                    </>
                  )}
                </Button>

                {/* Mensaje de ayuda para método guardado */}
                {selectedPayment === 'saved' && !selectedMethod && (
                  <p className="text-yellow-400 text-sm text-center mt-2">
                    Por favor, selecciona un método de pago guardado para continuar
                  </p>
                )}

                <p className="text-xs text-gray-500 text-center mt-4">
                  Al continuar, aceptas nuestros{' '}
                  <a href="#" className="text-red-400 hover:text-red-300">
                    Términos de Servicio
                  </a>{' '}
                  y{' '}
                  <a href="#" className="text-red-400 hover:text-red-300">
                    Política de Privacidad
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Garantía */}
          <div className="mt-12 text-center">
            <div className="bg-gray-800/30 rounded-lg p-6 max-w-2xl mx-auto">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Garantía de Satisfacción
              </h3>
              <p className="text-gray-400">
                Si no estás completamente satisfecho, cancela en cualquier momento. 
                Sin preguntas, sin complicaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PagoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <PagoContent />
    </Suspense>
  )
}
