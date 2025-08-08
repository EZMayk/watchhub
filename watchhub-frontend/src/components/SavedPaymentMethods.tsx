import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal'
  // Para tarjetas
  brand?: string
  last4?: string
  exp_month?: number
  exp_year?: number
  // Para PayPal
  paypal_email?: string
  paypal_payer_id?: string
  created: number
}

interface SavedPaymentMethodsProps {
  onSelectPaymentMethod?: (paymentMethodId: string) => void
  showSelection?: boolean
}

export default function SavedPaymentMethods({ 
  onSelectPaymentMethod, 
  showSelection = false 
}: SavedPaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  // Cargar métodos de pago al montar el componente
  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar métodos de Stripe
      const stripeResponse = await fetch('/api/stripe/payment-methods')
      const stripeData = await stripeResponse.json()

      // Cargar métodos de PayPal
      const paypalResponse = await fetch('/api/paypal/payment-methods')
      const paypalData = await paypalResponse.json()

      let allMethods: PaymentMethod[] = []

      // Agregar métodos de Stripe si hay
      if (stripeResponse.ok && stripeData.paymentMethods) {
        const stripeMethods = stripeData.paymentMethods.map((method: any) => ({
          ...method,
          type: 'card' as const
        }))
        allMethods = [...allMethods, ...stripeMethods]
      }

      // Agregar métodos de PayPal si hay
      if (paypalResponse.ok && paypalData.paymentMethods) {
        const paypalMethods = paypalData.paymentMethods.map((method: any) => ({
          ...method,
          type: 'paypal' as const,
          created: new Date(method.created_at).getTime() / 1000
        }))
        allMethods = [...allMethods, ...paypalMethods]
      }

      // Ordenar por fecha de creación (más recientes primero)
      allMethods.sort((a, b) => b.created - a.created)

      setPaymentMethods(allMethods)
    } catch (err) {
      console.error('Error loading payment methods:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const deletePaymentMethod = async (paymentMethodId: string) => {
    try {
      setDeleting(paymentMethodId)
      setError(null)

      // Determinar qué API usar basado en el tipo de método
      const method = paymentMethods.find(m => m.id === paymentMethodId)
      const apiEndpoint = method?.type === 'paypal' 
        ? '/api/paypal/payment-methods' 
        : '/api/stripe/payment-methods'

      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando método de pago')
      }

      // Actualizar la lista removiendo el método eliminado
      setPaymentMethods(prev => 
        prev.filter(method => method.id !== paymentMethodId)
      )

      // Si era el método seleccionado, deseleccionar
      if (selectedMethod === paymentMethodId) {
        setSelectedMethod(null)
      }

    } catch (err) {
      console.error('Error deleting payment method:', err)
      setError(err instanceof Error ? err.message : 'Error eliminando método de pago')
    } finally {
      setDeleting(null)
    }
  }

  const handleSelectMethod = (paymentMethodId: string) => {
    setSelectedMethod(paymentMethodId)
    if (onSelectPaymentMethod) {
      onSelectPaymentMethod(paymentMethodId)
    }
  }

  const formatCardBrand = (brand: string) => {
    const brandMap: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay'
    }
    return brandMap[brand.toLowerCase()] || brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Cargando métodos de pago...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error" className="mb-4">
        {error}
        <Button 
          onClick={loadPaymentMethods}
          className="ml-4 px-3 py-1 text-sm"
          variant="outline"
        >
          Reintentar
        </Button>
      </Alert>
    )
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tienes métodos de pago guardados
        </h3>
        <p className="text-gray-500">
          Los métodos de pago se guardarán automáticamente cuando realices tu primera compra
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Métodos de pago guardados
      </h3>
      
      {paymentMethods.map((method) => (
        <Card 
          key={method.id} 
          className={`p-4 transition-all duration-200 ${
            showSelection && selectedMethod === method.id 
              ? 'ring-2 ring-blue-500 border-blue-500' 
              : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showSelection && (
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => handleSelectMethod(method.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
              )}
              
              <div className="flex items-center space-x-3">
                {/* Icono según el tipo de método de pago */}
                <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-600">
                  {method.type === 'paypal' ? 'PayPal' : formatCardBrand(method.brand || '')}
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">
                    {method.type === 'paypal' 
                      ? method.paypal_email 
                      : `•••• •••• •••• ${method.last4}`
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {method.type === 'paypal' 
                      ? 'Cuenta PayPal' 
                      : `Vence ${formatExpiryDate(method.exp_month || 0, method.exp_year || 0)}`
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {showSelection && selectedMethod === method.id && (
                <span className="text-sm text-blue-600 font-medium">
                  Seleccionado
                </span>
              )}
              
              <Button
                onClick={() => deletePaymentMethod(method.id)}
                disabled={deleting === method.id}
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1"
              >
                {deleting === method.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Eliminar'
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {showSelection && selectedMethod && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <svg 
              className="h-5 w-5 text-blue-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="ml-2 text-sm font-medium text-blue-800">
              Método de pago seleccionado. Podrás completar la compra de forma rápida.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
