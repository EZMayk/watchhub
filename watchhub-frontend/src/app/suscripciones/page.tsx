'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Star, Zap, Crown, CreditCard, Shield, Play, Users, Smartphone, Monitor, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { Button, Card, CardContent, Badge, Alert } from '@/components/ui'
import { supabase } from '@/lib/supabase'
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

// Mapeo de nombres de iconos a componentes
const iconMap: { [key: string]: any } = {
  Play,
  Zap,
  Crown,
  Star,
  Shield,
  Users,
  Monitor,
  Smartphone
}

export default function SuscripcionesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando planes de suscripción...</p>
        </div>
      </div>
    }>
      <SuscripcionesContent />
    </Suspense>
  )
}

function SuscripcionesContent() {
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false)
  const [showRegistrationWelcome, setShowRegistrationWelcome] = useState(false)
  const [showEmailVerificationAlert, setShowEmailVerificationAlert] = useState(false)
  const [showEmailConfirmedAlert, setShowEmailConfirmedAlert] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    const fromRegister = searchParams.get('from')
    
    if (message === 'subscription_required') {
      setShowSubscriptionAlert(true)
    }
    
    if (message === 'email_confirmed') {
      setShowEmailConfirmedAlert(true)
    }
    
    if (fromRegister === 'register') {
      setShowRegistrationWelcome(true)
    }
  }, [searchParams])

  useEffect(() => {
    checkUser()
    loadPlans()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Verificar si el email está confirmado
        setEmailConfirmed(!!user.email_confirmed_at)
        
        // Si el email no está confirmado, mostrar alerta
        if (!user.email_confirmed_at) {
          setShowEmailVerificationAlert(true)
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  const resendVerificationEmail = async () => {
    if (!user?.email) return
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      })
      
      if (error) {
        console.error('Error reenviando email:', error)
        alert('Error al reenviar el correo de confirmación')
      } else {
        alert('Correo de confirmación reenviado. Revisa tu bandeja de entrada.')
      }
    } catch (error) {
      console.error('Error reenviando email:', error)
      alert('Error al reenviar el correo de confirmación')
    }
  }

  const loadPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('planes')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })

      if (error) {
        throw error
      }

      // Mapear los datos de la base de datos al formato esperado por el frontend
      const mappedPlans: Plan[] = (data || []).map(plan => ({
        ...plan,
        caracteristicas: Array.isArray(plan.caracteristicas) ? plan.caracteristicas : []
      }))

      setPlans(mappedPlans)
    } catch (error) {
      console.error('Error cargando planes:', error)
      setError('Error al cargar los planes. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planId: string) => {
    // Si el usuario no está autenticado, redirigir al login en lugar del registro
    if (!user) {
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(`/suscripciones/pago?plan=${planId}`)}`
      return
    }
    
    // Si el usuario está autenticado pero no ha confirmado su email, mostrar alerta
    if (user && !emailConfirmed) {
      setShowEmailVerificationAlert(true)
      // Scroll hacia arriba para mostrar la alerta
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    // Si está autenticado y email confirmado, ir directamente al pago
    window.location.href = `/suscripciones/pago?plan=${planId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando planes de suscripción...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error al cargar planes</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={loadPlans} className="bg-red-600 hover:bg-red-700">
            Intentar de nuevo
          </Button>
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
            <Link href="/">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert de bienvenida después del registro */}
      {showRegistrationWelcome && (
        <div className="bg-green-900/50 border-b border-green-500/30 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert
              variant="success"
              title="¡Bienvenido a WatchHub!"
              description="Tu cuenta ha sido creada exitosamente. Ahora elige el plan que mejor se adapte a tus necesidades para comenzar a disfrutar del mejor contenido."
              icon={<Check className="h-4 w-4" />}
              dismissible
              onDismiss={() => setShowRegistrationWelcome(false)}
              className="border-green-500/30 bg-green-900/20"
            />
          </div>
        </div>
      )}

      {/* Alert de suscripción requerida */}
      {showSubscriptionAlert && (
        <div className="bg-orange-900/50 border-b border-orange-500/30 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert
              variant="warning"
              title="Suscripción Requerida"
              description="Para acceder al contenido de WatchHub necesitas una suscripción activa. ¡Elige el plan que mejor se adapte a ti!"
              icon={<AlertCircle className="h-4 w-4" />}
              dismissible
              onDismiss={() => setShowSubscriptionAlert(false)}
              className="border-orange-500/30 bg-orange-900/20"
            />
          </div>
        </div>
      )}

      {/* Alert de email confirmado */}
      {showEmailConfirmedAlert && (
        <div className="bg-green-900/50 border-b border-green-500/30 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert
              variant="success"
              title="¡Correo Confirmado!"
              description="Tu correo electrónico ha sido confirmado exitosamente. Ahora puedes elegir tu plan de suscripción y empezar a disfrutar del contenido."
              icon={<CheckCircle className="h-4 w-4" />}
              dismissible
              onDismiss={() => setShowEmailConfirmedAlert(false)}
              className="border-green-500/30 bg-green-900/20"
            />
          </div>
        </div>
      )}

      {/* Alert de verificación de email */}
      {showEmailVerificationAlert && user && !emailConfirmed && (
        <div className="bg-yellow-900/50 border-b border-yellow-500/30 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border border-yellow-500/30 bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-yellow-200 font-semibold text-sm">
                    Verifica tu correo electrónico
                  </h3>
                  <div className="mt-2">
                    <p className="text-yellow-300 text-sm mb-3">
                      Necesitas confirmar tu correo electrónico ({user.email}) antes de poder suscribirte a un plan.
                    </p>
                    <Button 
                      onClick={resendVerificationEmail}
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      Reenviar correo de confirmación
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailVerificationAlert(false)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Badge className="bg-red-600/20 text-red-400 border-red-500/20 px-3 sm:px-4 py-1 sm:py-2 text-sm">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Planes de Suscripción
            </Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Elige tu{" "}
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Plan Perfecto
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Disfruta de miles de películas, series y documentales. 
            Cancela cuando quieras, sin compromisos.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-gray-300 p-4 rounded-lg bg-gray-800/30">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">Sin compromisos</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300 p-4 rounded-lg bg-gray-800/30">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">Cualquier dispositivo</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300 p-4 rounded-lg bg-gray-800/30">
              <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">Calidad premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Grid responsivo mejorado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan: Plan, index: number) => {
              // Determinar si es el plan más popular (el del medio)
              const isPopular = index === 1 && plans.length === 3
              
              // Mapeo de iconos y colores por tipo de plan
              const planConfig = {
                basico: { icon: Play, color: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' },
                estandar: { icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-500 to-orange-500' },
                premium: { icon: Crown, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' }
              }
              
              const config = planConfig[plan.nombre as keyof typeof planConfig] || planConfig.basico
              const IconComponent = config.icon
              
              return (
                <Card
                  key={plan.id}
                  className={`relative bg-gray-800/50 border-gray-700 backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:shadow-2xl hover:scale-[1.02] flex flex-col h-full ${
                    isPopular ? 'ring-2 ring-red-500/50 shadow-red-500/20 shadow-2xl scale-[1.02] lg:scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-red-600 text-white border-0 px-3 py-1 text-sm font-medium">
                        <Star className="w-3 h-3 mr-1" />
                        Más Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                    {/* Plan Header */}
                    <div className="text-center mb-6 flex-shrink-0">
                      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${config.gradient} mb-4`}>
                        <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${config.color}`} />
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.titulo}</h3>
                      <p className="text-gray-400 mb-4 text-sm sm:text-base">{plan.descripcion}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl sm:text-4xl font-bold text-white">${plan.precio_mensual}</span>
                          <span className="text-gray-400 ml-1 text-sm sm:text-base">/mes</span>
                        </div>
                        {plan.descuento_anual > 0 && (
                          <p className="text-xs sm:text-sm text-green-400 mt-1">
                            Ahorra {plan.descuento_anual}% con el plan anual
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Features - Sección que crece para ocupar espacio disponible */}
                    <div className="flex-grow">
                      <div className="space-y-3 sm:space-y-4 mb-6">
                        {plan.caracteristicas.map((feature: string) => (
                          <div key={feature} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                            </div>
                            <span className="text-gray-300 text-xs sm:text-sm leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button - Siempre al final */}
                    <div className="flex-shrink-0 mt-auto">
                      <Button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={user && !emailConfirmed}
                        className={`w-full py-3 sm:py-4 font-semibold transition-all duration-300 text-sm sm:text-base ${
                          user && !emailConfirmed
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : isPopular 
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25' 
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {user && !emailConfirmed ? 'Confirma tu email primero' : 'Elegir Plan'}
                        {(!user || emailConfirmed) && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-900/50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">
            Preguntas Frecuentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-gray-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:bg-gray-800/60 h-full flex flex-col">
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-red-400 transform rotate-90" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">
                  ¿Puedo cambiar de plan en cualquier momento?
                </h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed ml-12">
                Sí, puedes actualizar o degradar tu plan cuando quieras desde tu cuenta. Los cambios se aplicarán en el siguiente ciclo de facturación.
              </p>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:bg-gray-800/60 h-full flex flex-col">
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">
                  ¿Cómo funciona la facturación?
                </h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed ml-12">
                La facturación es mensual o anual según el plan que elijas. El cargo se realiza automáticamente en la fecha de renovación.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:bg-gray-800/60 h-full flex flex-col">
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">
                  ¿Qué métodos de pago aceptan?
                </h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed ml-12">
                Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express) y PayPal para tu comodidad.
              </p>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:bg-gray-800/60 h-full flex flex-col">
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">
                  ¿Puedo cancelar mi suscripción?
                </h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed ml-12">
                Por supuesto. Puedes cancelar tu suscripción en cualquier momento desde tu cuenta, sin penalizaciones ni preguntas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Trust */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
            Pago Seguro y Protegido
          </h2>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <span className="text-gray-400 text-sm sm:text-base">SSL Encriptado</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="text-gray-400 text-sm sm:text-base">Stripe & PayPal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <span className="text-gray-400 text-sm sm:text-base">+1M usuarios confían</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
