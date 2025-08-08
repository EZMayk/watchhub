'use client'

import { useSubscriptionRedirect } from '@/hooks/useSubscription'
import { LoadingSpinner } from '@/components/ui'

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function SubscriptionProtectedRoute({ 
  children, 
  fallback 
}: SubscriptionProtectedRouteProps) {
  const { hasActiveSubscription, isAdmin, loading } = useSubscriptionRedirect()

  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Verificando suscripción...</p>
        </div>
      </div>
    )
  }

  // Si es admin o tiene suscripción activa, mostrar el contenido
  if (isAdmin || hasActiveSubscription) {
    return <>{children}</>
  }

  // Si no tiene suscripción, el hook se encargará de redirigir
  // Mientras tanto, mostrar un mensaje
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 mt-4">Redirigiendo a suscripciones...</p>
      </div>
    </div>
  )
}
