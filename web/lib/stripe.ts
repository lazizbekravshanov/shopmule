import Stripe from 'stripe';

// Allow build to succeed without Stripe key (only required at runtime)
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-12-15.clover',
});
