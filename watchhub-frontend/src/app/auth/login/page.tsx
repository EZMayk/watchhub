'use client'
import { useState, useCallback, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Film } from 'lucide-react'
import { Button, Input, Card, CardContent, Alert } from '@/components/ui'

interface UserAccount {
  rol: string
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Manejar mensajes iniciales basados en parámetros de URL
  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam === 'subscription_registered') {
      setMessage('¡Perfecto! Tu cuenta ha sido creada y tu suscripción está activa. ¡Inicia sesión para empezar a disfrutar!')
    } else if (messageParam === 'registered') {
      setMessage('Registro exitoso. Inicia sesión para continuar.')
    } else if (messageParam === 'payment_success') {
      setMessage('¡Pago exitoso! Tu suscripción está activa. Inicia sesión para acceder al contenido.')
    }
  }, [searchParams])

  const validateForm = useCallback((): boolean => {
    if (!email) {
      setError('El correo electrónico es requerido')
      return false
    }

    if (!email.includes('@')) {
      setError('Ingresa un correo electrónico válido')
      return false
    }

    if (!password) {
      setError('La contraseña es requerida')
      return false
    }

    return true
  }, [email, password])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Obtener información del usuario para determinar redirección
        const { data: userAccount } = await supabase
          .from('cuentas')
          .select('rol')
          .eq('id', data.user.id)
          .single()

        // Verificar si es admin
        const isAdmin = (userAccount as UserAccount)?.rol === 'admin'

        setMessage('¡Inicio de sesión exitoso! Redirigiendo...')
        
        setTimeout(async () => {
          // Verificar si hay una URL de redirección
          const searchParams = new URLSearchParams(window.location.search)
          const redirectTo = searchParams.get('redirectTo')
          
          if (redirectTo) {
            // Si hay una URL de redirección, verificar permisos
            if (redirectTo.startsWith('/admin') && isAdmin) {
              router.push(redirectTo)
            } else if (redirectTo.startsWith('/admin') && !isAdmin) {
              // Si intenta acceder a admin sin permisos, ir al dashboard de usuario
              router.push('/pages/dashboard-user?error=access_denied')
            } else {
              router.push(redirectTo)
            }
          } else if (isAdmin) {
            // Redirección por defecto para admin
            router.push('/admin')
          } else {
            // Para usuarios regulares, verificar suscripción antes de redirigir
            try {
              const { data: subscription } = await supabase
                .from('suscripciones')
                .select('*')
                .eq('cuenta_id', data.user.id)
                .eq('activa', true)
                .gt('expira_en', new Date().toISOString())
                .single()

              if (subscription) {
                // Tiene suscripción activa, ir al dashboard
                router.push('/pages/dashboard-user')
              } else {
                // No tiene suscripción activa, ir a planes
                router.push('/suscripciones?message=subscription_required')
              }
            } catch (subscriptionError) {
              // Error al verificar suscripción o no tiene suscripción, ir a planes
              router.push('/suscripciones?message=subscription_required')
            }
          }
        }, 1500)
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo electrónico antes de iniciar sesión.')
      } else {
        setError(errorMessage || 'Ocurrió un error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }, [email, password, router, validateForm])

  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      setError('Ingresa tu correo electrónico primero')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setMessage('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al enviar correo: ${errorMessage}`)
    }
  }, [email])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword)
  }, [showPassword])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header Mejorado con sistema CSS global */}
        <div className="text-center mb-8 animate-fadeInUp">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors mb-6 hover-lift"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-600/20 rounded-full backdrop-blur-sm animate-float">
              <Film className="h-12 w-12 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-gradient">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-400 text-lg">
            Inicia sesión para continuar tu experiencia de streaming
          </p>
        </div>

        <Card variant="glass" className="card-glass hover-lift border-gray-700/50">
          <CardContent className="p-8">{/* Alerts mejorados */}
            {error && (
              <Alert
                variant="error"
                description={error}
                dismissible
                onDismiss={() => setError('')}
                className="mb-6 animate-slideDown"
              />
            )}

            {message && (
              <Alert
                variant="success"
                description={message}
                className="mb-6 animate-slideDown"
              />
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="email"
                  label="Correo electrónico"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  className="input-glass"
                  required
                />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-gray-400 hover:text-white transition-colors p-1 hover-lift"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  className="input-glass"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer hover-lift">
                  <input
                    type="checkbox"
                    className="rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-gray-800 transition-all"
                  />
                  <span className="ml-2 text-sm text-gray-400">Recordarme</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-red-500 hover:text-red-400 transition-colors hover-lift"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full hover-lift btn-gradient"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                ¿No tienes una cuenta?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-red-500 hover:text-red-400 font-medium transition-colors hover-lift"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info mejorado */}
        <div className="text-center mt-8 animate-fadeInUp">
          <p className="text-xs text-gray-500 leading-relaxed">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="#" className="text-red-500 hover:text-red-400 transition-colors hover-lift">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="#" className="text-red-500 hover:text-red-400 transition-colors hover-lift">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}