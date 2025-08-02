'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Film, AlertCircle, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const router = useRouter()

  const validateForm = () => {
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
  }

  const handleLogin = async (e: React.FormEvent) => {
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

        setMessage('¡Inicio de sesión exitoso! Redirigiendo...')
        
        setTimeout(() => {
          // Verificar si hay una URL de redirección
          const searchParams = new URLSearchParams(window.location.search)
          const redirectTo = searchParams.get('redirectTo')
          
          if (redirectTo) {
            // Si hay una URL de redirección, verificar permisos
            if (redirectTo.startsWith('/admin') && userAccount?.rol === 'admin') {
              router.push(redirectTo)
            } else if (redirectTo.startsWith('/admin') && userAccount?.rol !== 'admin') {
              // Si intenta acceder a admin sin permisos, ir al dashboard de usuario
              router.push('/pages/dashboard-user?error=access_denied')
            } else {
              router.push(redirectTo)
            }
          } else {
            // Redirección por defecto basada en el rol
            if (userAccount?.rol === 'admin') {
              router.push('/admin')
            } else {
              router.push('/pages/dashboard-user')
            }
          }
        }, 1500)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.message.includes('Invalid login credentials')) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo electrónico antes de iniciar sesión.')
      } else {
        setError(error.message || 'Ocurrió un error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
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
    } catch (error: any) {
      setError(`Error al enviar correo: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header Mejorado */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-600/20 rounded-full">
              <Film className="h-12 w-12 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-400">
            Inicia sesión para continuar tu experiencia de streaming
          </p>
        </div>

        <Card variant="elevated" className="border-gray-700">
          <CardContent className="p-8">
            {/* Alerts */}
            {error && (
              <Alert
                variant="error"
                description={error}
                dismissible
                onDismiss={() => setError('')}
                className="mb-6"
              />
            )}

            {message && (
              <Alert
                variant="success"
                description={message}
                className="mb-6"
              />
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                type="email"
                label="Correo electrónico"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
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
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-gray-800"
                  />
                  <span className="ml-2 text-sm text-gray-400">Recordarme</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-red-500 hover:text-red-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                ¿No tienes una cuenta?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-red-500 hover:text-red-400 font-medium transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="#" className="text-red-500 hover:text-red-400 transition-colors">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="#" className="text-red-500 hover:text-red-400 transition-colors">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}