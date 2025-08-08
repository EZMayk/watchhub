import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com'

// Función para obtener token de acceso de PayPal
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { token, payerId, planId } = await request.json()

    // Validar datos
    if (!token || !payerId || !planId) {
      return NextResponse.json(
        { error: 'Datos de captura incompletos' },
        { status: 400 }
      )
    }

    // Obtener token de acceso
    const accessToken = await getPayPalAccessToken()

    // Capturar el pago
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await response.json()

    if (!response.ok) {
      console.error('PayPal capture failed:', captureData)
      return NextResponse.json(
        { error: 'Error al capturar el pago de PayPal' },
        { status: 400 }
      )
    }

    // Verificar que el pago fue completado
    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'El pago no fue completado' },
        { status: 400 }
      )
    }

    // Extraer información del pago
    const purchaseUnit = captureData.purchase_units?.[0]
    const capture = purchaseUnit?.payments?.captures?.[0]
    const amount = parseFloat(capture?.amount?.value || '0')

    return NextResponse.json({
      orderId: captureData.id,
      payerId,
      planId,
      amount,
      status: captureData.status,
      captureId: capture?.id,
      payerEmail: captureData.payer?.email_address,
    })
  } catch (error) {
    console.error('Error capturing PayPal payment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
