import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  try {
    // Verificar si la clave secreta de Stripe está configurada
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY not configured',
        details: 'Please set your Stripe secret key in environment variables'
      }, { status: 500 })
    }

    // Intentar inicializar Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })

    // Hacer una petición simple para verificar que la clave funciona
    const account = await stripe.accounts.retrieve()
    
    return NextResponse.json({
      status: 'ok',
      stripe_configured: true,
      account_id: account.id,
      country: account.country,
      business_name: account.business_profile?.name || 'Not set'
    })
  } catch (error) {
    console.error('Stripe configuration error:', error)
    
    return NextResponse.json({
      error: 'Stripe configuration error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stripe_configured: false
    }, { status: 500 })
  }
}
