import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { stripePlanToSubscriptionPlan } from "@/lib/billing";
import type { SubscriptionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type WebhookPayload = Record<string, unknown> & {
  customer?: string;
  metadata?: Record<string, string>;
  subscription?: string;
  status?: string;
  items?: { data?: Array<{ price?: { id?: string } }> };
};

/**
 * Stripe webhook handler.
 * Processes subscription lifecycle events to keep tenant billing state in sync.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const payload = event.data.object as unknown as WebhookPayload;

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(payload);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(payload);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(payload);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(payload);
        break;

      case "invoice.paid":
        await handleInvoicePaid(payload);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: WebhookPayload) {
  const tenantId = session.metadata?.tenantId;
  const plan = session.metadata?.plan;

  if (!tenantId || !plan) {
    console.warn("[Stripe Webhook] checkout.session.completed missing metadata");
    return;
  }

  const subscriptionPlan = stripePlanToSubscriptionPlan(plan) ?? plan;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionPlan: subscriptionPlan as never,
      subscriptionStatus: "ACTIVE",
      stripeSubscriptionId: (session.subscription as string) ?? undefined,
      trialEndsAt: null,
    },
  });

  console.log(`[Stripe Webhook] Tenant ${tenantId} upgraded to ${subscriptionPlan}`);
}

async function handleSubscriptionUpdated(subscription: WebhookPayload) {
  const tenant = await findTenantByStripeCustomer(subscription.customer);
  if (!tenant) return;

  const statusMap: Record<string, SubscriptionStatus> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELLED",
    paused: "PAUSED",
    unpaid: "PAST_DUE",
    incomplete: "PAST_DUE",
    incomplete_expired: "CANCELLED",
    trialing: "ACTIVE",
  };

  const newStatus = statusMap[subscription.status ?? ""] ?? "ACTIVE";

  const priceId = subscription.items?.data?.[0]?.price?.id;
  const plan = priceId ? stripePlanToSubscriptionPlan(priceId) : undefined;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: newStatus,
      ...(plan ? { subscriptionPlan: plan } : {}),
    },
  });

  console.log(`[Stripe Webhook] Tenant ${tenant.id} subscription status → ${newStatus}`);
}

async function handleSubscriptionDeleted(subscription: WebhookPayload) {
  const tenant = await findTenantByStripeCustomer(subscription.customer);
  if (!tenant) return;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionPlan: "FREE",
      subscriptionStatus: "CANCELLED",
      stripeSubscriptionId: null,
    },
  });

  console.log(`[Stripe Webhook] Tenant ${tenant.id} subscription cancelled → FREE`);
}

async function handlePaymentFailed(invoice: WebhookPayload) {
  const tenant = await findTenantByStripeCustomer(invoice.customer);
  if (!tenant) return;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { subscriptionStatus: "PAST_DUE" },
  });

  console.log(`[Stripe Webhook] Tenant ${tenant.id} payment failed → PAST_DUE`);
}

async function handleInvoicePaid(invoice: WebhookPayload) {
  const tenant = await findTenantByStripeCustomer(invoice.customer);
  if (!tenant) return;

  if (tenant.subscriptionStatus === "PAST_DUE") {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { subscriptionStatus: "ACTIVE" },
    });
    console.log(`[Stripe Webhook] Tenant ${tenant.id} payment recovered → ACTIVE`);
  }
}

async function findTenantByStripeCustomer(customerId: string | undefined) {
  if (!customerId) return null;

  const tenant = await prisma.tenant.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, subscriptionStatus: true },
  });

  if (!tenant) {
    console.warn(`[Stripe Webhook] No tenant found for Stripe customer ${customerId}`);
  }

  return tenant;
}
