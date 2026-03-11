import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/**
 * Lazily create a Stripe instance. Throws at runtime (not build time)
 * if STRIPE_SECRET_KEY is missing.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Configure it in your .env file.'
      );
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
}

/**
 * @deprecated Use getStripe() instead for explicit initialization.
 * This export exists for backwards compatibility — it will throw a clear
 * error at runtime if STRIPE_SECRET_KEY is missing (no silent placeholder).
 */
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get paymentIntents() { return getStripe().paymentIntents; },
  get webhooks() { return getStripe().webhooks; },
  get subscriptions() { return getStripe().subscriptions; },
  get prices() { return getStripe().prices; },
  get products() { return getStripe().products; },
  get invoices() { return getStripe().invoices; },
} as unknown as Stripe;
