'use client'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button, Input, Card, CardContent, Alert, LoadingSpinner } from '@/components/ui'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [validToken, setValidToken] = useState<boolean | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const validateToken = () => {
      // Dar tiempo para que el hash se cargue completamente
      setTimeout(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        const refreshToken = hashParams.get('refresh_token')

        console.log('Hash params:', { accessToken, type, refreshToken }) // Debug

        // Si hay un access_token y es de tipo recovery, es válido
        if (accessToken && type === 'recovery') {
          setValidToken(true)
          // Establecer la sesión con los tokens si están disponibles
          if (refreshToken) {
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
          }
        } else if (window.location.hash) {
          // Si hay hash pero no es válido
          setValidToken(false)
          setError('Enlace de recuperación inválido o expirado. Solicita un nuevo enlace de recuperación.')
        } else {
          // Si no hay hash, asumir que es una página directa (para testing)
          console.log('No hash found, assuming direct access for testing')
          setValidToken(true) // Temporal para testing
        }
      }, 200) // Aumentamos el timeout
    }

    validateToken()
  }, [])

  const validateForm = useCallback((): boolean => {
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    if (password.length > 72) {
      setError('La contraseña no puede tener más de 72 caracteres')
      return false
    }

    return true
  }, [password, confirmPassword])

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // Verificar si hay una sesión activa
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Si no hay sesión, intentar establecerla desde el hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
        } else {
          throw new Error('No se pudo establecer la sesión para actualizar la contraseña')
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('¡Contraseña actualizada exitosamente! Redirigiendo al login...')
      
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Reset password error:', errorMessage) // Debug
      
      if (errorMessage.includes('session')) {
        setError('Sesión expirada. Solicita un nuevo enlace de recuperación.')
      } else {
        setError(errorMessage || 'Error al actualizar la contraseña')
      }
    } finally {
      setLoading(false)
    }
  }, [password, router, validateForm])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword)
  }, [showPassword])

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(!showConfirmPassword)
  }, [showConfirmPassword])

  // Mostrar loading mientras se valida el token
  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Validando enlace de recuperación..." />
        </div>
      </div>
    )
  }

  // Si el token no es válido, mostrar error
  if (validToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-600/20 rounded-full backdrop-blur-sm">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-gradient">
              Enlace Inválido
            </h1>
            <p className="text-gray-400 text-sm">
              El enlace de recuperación ha expirado
            </p>
          </div>

          <Card variant="glass" className="card-glass">
            <CardContent className="p-6 text-center">
              <Alert
                variant="error"
                description="Este enlace ha expirado. Solicita un nuevo enlace desde la página de login."
                className="mb-4 text-sm"
              />
              
              <div className="flex flex-col gap-3">
                <Link href="/auth/login">
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full hover-lift"
                  >
                    Ir al Login
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full hover-lift"
                  >
                    Inicio
                  </Button>
                </Link>
              </div>
              
              {/* Botón temporal para testing */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setValidToken(true)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  [DEBUG] Mostrar formulario
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header compacto */}
        <div className="text-center mb-6">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors mb-4 hover-lift text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al login</span>
          </Link>
          
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-red-600/20 rounded-full backdrop-blur-sm animate-float">
              <Lock className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-gradient">
            Nueva Contraseña
          </h1>
          <p className="text-gray-400 text-sm">
            Ingresa tu nueva contraseña para WatchHub
          </p>
        </div>

        <Card variant="glass" className="card-glass hover-lift border-gray-700/50">
          <CardContent className="p-6">
            {/* Alerts compactos */}
            {error && (
              <Alert
                variant="error"
                description={error}
                dismissible
                onDismiss={() => setError('')}
                className="mb-4 animate-slideDown text-sm"
                icon={<AlertCircle className="h-4 w-4" />}
              />
            )}

            {message && (
              <Alert
                variant="success"
                description={message}
                className="mb-4 animate-slideDown text-sm"
                icon={<CheckCircle className="h-4 w-4" />}
              />
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Contraseñas en grid compacto */}
              <div className="space-y-3">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Nueva Contraseña"
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
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  }
                  className="input-glass text-sm"
                  helperText="6-72 caracteres"
                  required
                />

                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirmar Contraseña"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="text-gray-400 hover:text-white transition-colors p-1 hover-lift"
                      aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  }
                  className="input-glass text-sm"
                  helperText="Debe coincidir"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full hover-lift btn-gradient"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </form>

            {/* Link compacto */}
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                ¿Recordaste tu contraseña?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-red-500 hover:text-red-400 font-medium transition-colors hover-lift"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}