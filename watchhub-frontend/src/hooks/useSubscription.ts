'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  isAdmin: boolean
  loading: boolean
  user: any
}

export function useSubscriptionCheck(): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    isAdmin: false,
    loading: true,
    user: null
  })
  const router = useRouter()

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setStatus(prev => ({ ...prev, loading: false }))
        return
      }

      // Verificar si es admin

      const { data: userAccount } = await supabase
        .from('cuentas')
        .select('rol')
        .eq('id', user.id)
        .single()

      const isAdmin = userAccount?.rol === 'admin'

      if (isAdmin) {
        setStatus({
          hasActiveSubscription: true, // Los admins siempre tienen "acceso"
          isAdmin: true,
          loading: false,
          user
        })
        return
      }

      // Verificar suscripción activa para usuarios regulares
      const { data: subscription } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('cuenta_id', user.id)
        .eq('activa', true)
        .gt('expira_en', new Date().toISOString())
        .single()

      setStatus({
        hasActiveSubscription: !!subscription,
        isAdmin: false,
        loading: false,
        user
      })

    } catch (error) {
      console.error('Error checking subscription status:', error)
      setStatus(prev => ({ ...prev, loading: false }))
    }
  }

  return status
}

// Hook específico para redirigir usuarios sin suscripción
export function useSubscriptionRedirect() {
  const router = useRouter()
  const { hasActiveSubscription, isAdmin, loading, user } = useSubscriptionCheck()

  useEffect(() => {
    if (!loading && user && !isAdmin && !hasActiveSubscription) {
      // Redirigir a suscripciones si el usuario no tiene plan activo
      router.push('/suscripciones?message=subscription_required')
    }
  }, [loading, user, isAdmin, hasActiveSubscription, router])

  return { hasActiveSubscription, isAdmin, loading, user }
}
