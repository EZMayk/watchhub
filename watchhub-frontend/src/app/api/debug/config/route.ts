import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        service_role_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      },
      stripe: {
        secret: !!process.env.STRIPE_SECRET_KEY,
        public: !!process.env.STRIPE_PUBLISHABLE_KEY,
        webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      },
      paypal: {
        client_id: !!process.env.PAYPAL_CLIENT_ID,
        client_secret: !!process.env.PAYPAL_CLIENT_SECRET,
      }
    }

    return NextResponse.json(envVars)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error checking environment' },
      { status: 500 }
    )
  }
}
