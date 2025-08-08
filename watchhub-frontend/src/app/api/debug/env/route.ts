import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar que las variables de entorno necesarias estén presentes
    const hasStripeSecret = !!process.env.STRIPE_SECRET_KEY
    const hasStripePublic = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('Environment check:', {
      hasStripeSecret,
      hasStripePublic,
      hasSupabaseUrl,
      hasSupabaseKey,
      stripeSecretLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      stripePublicLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0
    })

    return NextResponse.json({
      stripe: {
        hasSecret: hasStripeSecret,
        hasPublic: hasStripePublic,
        secretLength: process.env.STRIPE_SECRET_KEY?.length || 0,
        publicLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0
      },
      supabase: {
        hasUrl: hasSupabaseUrl,
        hasKey: hasSupabaseKey
      }
    })
  } catch (error) {
    console.error('Environment check error:', error)
    return NextResponse.json(
      { error: 'Error checking environment' },
      { status: 500 }
    )
  }
}
