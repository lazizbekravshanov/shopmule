'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode, useMemo } from 'react';

// Lazy load stripe only when key is available
let stripePromise: Promise<Stripe | null> | null = null;

function getStripe() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.warn('Stripe publishable key not configured');
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const stripe = useMemo(() => getStripe(), []);

  if (!stripe) {
    return (
      <div className="p-4 text-center text-neutral-500">
        <p>Stripe is not configured.</p>
        <p className="text-sm mt-1">Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable card payments.</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#ee7a14',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
