import { loadStripe } from '@stripe/stripe-js';

// Asegúrate de que la clave pública de Stripe esté configurada
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY no está configurada');
}

// Cargar Stripe de forma lazy
export const stripePromise = loadStripe(stripePublicKey);

// Configuración de productos y precios de Stripe
export const STRIPE_PRICE_IDS = {
  basico: 'price_basico_monthly', // Reemplaza con tus IDs reales de Stripe
  estandar: 'price_estandar_monthly',
  premium: 'price_premium_monthly'
};

// Función para crear sesión de checkout
export const createCheckoutSession = async (priceId: string, planId: string) => {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        planId,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al crear sesión de checkout');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Función para redirigir a Stripe Checkout
export const redirectToCheckout = async (priceId: string, planId: string) => {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe no se ha cargado correctamente');
    }

    const session = await createCheckoutSession(priceId, planId);
    
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};
