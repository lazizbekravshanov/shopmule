import type { SubscriptionPlan } from "@prisma/client";

/**
 * Maps internal plan names to Stripe Price IDs.
 * Set these via environment variables.
 */
export const PLAN_PRICE_MAP: Record<string, string | undefined> = {
  STARTER: process.env.STRIPE_SHOP_PRICE_ID,
  PRO: process.env.STRIPE_PRO_PRICE_ID,
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

/**
 * Reverse lookup: given a Stripe Price ID, return the internal SubscriptionPlan.
 * Returns undefined if the price ID doesn't match any known plan.
 */
export function stripePlanToSubscriptionPlan(
  priceId: string
): SubscriptionPlan | undefined {
  for (const [plan, id] of Object.entries(PLAN_PRICE_MAP)) {
    if (id && id === priceId) {
      return plan as SubscriptionPlan;
    }
  }
  return undefined;
}
