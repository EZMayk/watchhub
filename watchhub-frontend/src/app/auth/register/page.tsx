'use client'
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Crown, AlertCircle, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardContent, Alert } from '@/components/ui'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const router = useRouter()

  const validateForm = useCallback((): boolean => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Nombre y apellido son requeridos')
      return false
    }

    if (!email) {
      setError('El correo electrónico es requerido')
      return false
    }

    if (!email.includes('@')) {
      setError('Ingresa un correo electrónico válido')
      return false
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (password.length > 72) {
      setError('La contraseña no puede tener más de 72 caracteres')
      return false
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return false
    }

    return true
  }, [firstName, lastName, email, password, confirmPassword, acceptTerms])

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`
          }
        }
      })

      if (error) throw error

      if (data.user) {
        setMessage('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.')
        
        // Limpiar formulario después del registro exitoso
        setTimeout(() => {
          router.push('/auth/login?message=registered')
        }, 3000)
      }
    } catch (error: unknown) {
      console.error('Register error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      if (errorMessage.includes('User already registered')) {
        setError('Este correo ya está registrado. Intenta iniciar sesión.')
      } else if (errorMessage.includes('Password should be at least 6 characters')) {
        setError('La contraseña debe tener al menos 6 caracteres')
      } else {
        setError(errorMessage || 'Ocurrió un error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }, [firstName, lastName, email, password, router, validateForm])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword)
  }, [showPassword])

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(!showConfirmPassword)
  }, [showConfirmPassword])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header compacto */}
        <div className="text-center mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors mb-4 hover-lift text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-red-600/20 rounded-full backdrop-blur-sm animate-float">
              <Crown className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-gradient">
            Únete a WatchHub
          </h1>
          <p className="text-gray-400 text-sm">
            La mejor plataforma de streaming te espera
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

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nombres en grid compacto */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  label="Nombre"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                  className="input-glass text-sm"
                  required
                />
                <Input
                  type="text"
                  label="Apellido"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                  className="input-glass text-sm"
                  required
                />
              </div>

              {/* Email */}
              <Input
                type="email"
                label="Correo Electrónico"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                className="input-glass text-sm"
                required
              />

              {/* Contraseñas en grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  }
                  className="input-glass text-sm"
                  required
                />

                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirmar"
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
                  required
                />
              </div>

              {/* Términos compactos */}
              <div className="flex items-start space-x-2">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded mt-0.5 bg-gray-700"
                  required
                />
                <label htmlFor="accept-terms" className="text-xs text-gray-400 leading-tight">
                  Acepto los{' '}
                  <Link href="/terms" className="text-red-500 hover:text-red-400 hover-lift">
                    términos
                  </Link>
                  {' '}y{' '}
                  <Link href="/privacy" className="text-red-500 hover:text-red-400 hover-lift">
                    política de privacidad
                  </Link>
                </label>
              </div>

              {/* Botón de registro */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full hover-lift btn-gradient"
                disabled={loading || !firstName || !lastName || !email || !password || !confirmPassword || !acceptTerms}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            {/* Link de login compacto */}
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                ¿Ya tienes cuenta?{' '}
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