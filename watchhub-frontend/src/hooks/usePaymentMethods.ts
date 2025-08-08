import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface PaymentMethod {
  id: string
  usuario_id: string
  tipo_proveedor: 'stripe' | 'paypal'
  
  // Stripe fields
  stripe_payment_method_id?: string
  stripe_customer_id?: string
  
  // PayPal fields
  paypal_account_id?: string
  paypal_email?: string
  paypal_payer_id?: string
  
  // General info
  nickname?: string
  is_default: boolean
  last_four?: string
  brand?: string
  tipo_metodo?: string
  
  // Status
  activo: boolean
  verificado: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
  last_used_at?: string
}

interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[]
  loading: boolean
  error: string | null
  selectedMethod: string | null
  loadPaymentMethods: () => Promise<void>
  deletePaymentMethod: (paymentMethodId: string) => Promise<void>
  selectPaymentMethod: (paymentMethodId: string) => void
  clearSelection: () => void
  processQuickPayment: (paymentData: QuickPaymentData) => Promise<QuickPaymentResult>
  addStripePaymentMethod: (stripePaymentMethodId: string, nickname?: string) => Promise<PaymentMethod>
  addPayPalPaymentMethod: (paypalData: PayPalMethodData) => Promise<PaymentMethod>
  setDefaultPaymentMethod: (id: string) => Promise<void>
  updatePaymentMethodNickname: (id: string, nickname: string) => Promise<void>
}

interface QuickPaymentData {
  planId: string
  planName: string
  planType?: string
  planPrice: number
  paymentMethodId: string
}

interface QuickPaymentResult {
  success: boolean
  subscriptionId?: string
  status?: string
  clientSecret?: string
  requiresAction?: boolean
  message?: string
  error?: string
}

interface PayPalMethodData {
  account_id: string
  email: string
  payer_id?: string
  nickname?: string
}

export function usePaymentMethods(): UsePaymentMethodsReturn {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPaymentMethods([])
        return
      }

      const { data, error: fetchError } = await supabase
        .from('metodos_pago')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('activo', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setPaymentMethods(data || [])
    } catch (err) {
      console.error('Error loading payment methods:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar métodos de pago')
    } finally {
      setLoading(false)
    }
  }, [])

  const addStripePaymentMethod = async (
    stripePaymentMethodId: string, 
    nickname?: string
  ): Promise<PaymentMethod> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Obtener detalles del payment method de Stripe
      const response = await fetch('/api/stripe/payment-method-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method_id: stripePaymentMethodId })
      })

      if (!response.ok) throw new Error('Error al obtener detalles del método de pago')
      
      const stripeDetails = await response.json()

      const { data, error } = await supabase
        .from('metodos_pago')
        .insert({
          usuario_id: user.id,
          tipo_proveedor: 'stripe',
          stripe_payment_method_id: stripePaymentMethodId,
          stripe_customer_id: stripeDetails.customer,
          nickname: nickname || `${stripeDetails.card?.brand} •••• ${stripeDetails.card?.last4}`,
          last_four: stripeDetails.card?.last4,
          brand: stripeDetails.card?.brand,
          tipo_metodo: 'card',
          verificado: true,
          is_default: paymentMethods.length === 0 // Primer método es por defecto
        })
        .select()
        .single()

      if (error) throw error

      await loadPaymentMethods()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar método de pago'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const addPayPalPaymentMethod = async (paypalData: PayPalMethodData): Promise<PaymentMethod> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('metodos_pago')
        .insert({
          usuario_id: user.id,
          tipo_proveedor: 'paypal',
          paypal_account_id: paypalData.account_id,
          paypal_email: paypalData.email,
          paypal_payer_id: paypalData.payer_id,
          nickname: paypalData.nickname || `PayPal (${paypalData.email})`,
          last_four: paypalData.email.slice(-4),
          brand: 'PayPal',
          tipo_metodo: 'paypal_account',
          verificado: true,
          is_default: paymentMethods.length === 0 // Primer método es por defecto
        })
        .select()
        .single()

      if (error) throw error

      await loadPaymentMethods()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar cuenta de PayPal'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const setDefaultPaymentMethod = async (id: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Quitar default de todos los métodos del usuario
      await supabase
        .from('metodos_pago')
        .update({ is_default: false })
        .eq('usuario_id', user.id)

      // Establecer el nuevo método por defecto
      const { error } = await supabase
        .from('metodos_pago')
        .update({ is_default: true, last_used_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      await loadPaymentMethods()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al establecer método por defecto'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updatePaymentMethodNickname = async (id: string, nickname: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('metodos_pago')
        .update({ nickname })
        .eq('id', id)

      if (error) throw error

      await loadPaymentMethods()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar nickname'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deletePaymentMethod = useCallback(async (paymentMethodId: string): Promise<void> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('metodos_pago')
        .update({ activo: false })
        .eq('id', paymentMethodId)

      if (error) throw error

      // Actualizar la lista local
      setPaymentMethods(prev =>
        prev.filter(method => method.id !== paymentMethodId)
      )

      // Limpiar selección si era el método seleccionado
      if (selectedMethod === paymentMethodId) {
        setSelectedMethod(null)
      }

      await loadPaymentMethods()
    } catch (err) {
      console.error('Error deleting payment method:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar método de pago'
      setError(errorMessage)
    }
  }, [selectedMethod, loadPaymentMethods])

  const selectPaymentMethod = useCallback((paymentMethodId: string) => {
    setSelectedMethod(paymentMethodId)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedMethod(null)
  }, [])

  const processQuickPayment = useCallback(async (paymentData: QuickPaymentData): Promise<QuickPaymentResult> => {
    try {
      setError(null)

      const response = await fetch('/api/stripe/quick-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error procesando el pago')
      }

      return {
        success: true,
        subscriptionId: result.subscriptionId,
        status: result.status,
        clientSecret: result.clientSecret,
        requiresAction: result.requiresAction,
        message: result.message
      }
    } catch (err) {
      console.error('Error processing quick payment:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error procesando el pago'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [])

  useEffect(() => {
    loadPaymentMethods()
  }, [loadPaymentMethods])

  return {
    paymentMethods,
    loading,
    error,
    selectedMethod,
    loadPaymentMethods,
    deletePaymentMethod,
    selectPaymentMethod,
    clearSelection,
    processQuickPayment,
    addStripePaymentMethod,
    addPayPalPaymentMethod,
    setDefaultPaymentMethod,
    updatePaymentMethodNickname
  }
}
