import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { stripePlanToSubscriptionPlan } from '@/lib/billing';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { invoiceId } = paymentIntent.metadata;

  if (!invoiceId) {
    console.error('Missing invoiceId in payment intent metadata');
    return;
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (existingPayment) {
    console.log(`Payment already recorded for ${paymentIntent.id}`);
    return;
  }

  const amountInDollars = paymentIntent.amount / 100;

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        invoiceId,
        method: 'STRIPE',
        amount: amountInDollars,
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge as string | null,
        stripeStatus: 'succeeded',
      },
    });

    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { LegacyPayments: true },
    });

    if (invoice) {
      const totalPaid =
        invoice.LegacyPayments.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0) +
        amountInDollars;
      const invoiceTotal = Number(invoice.total);
      const newStatus = totalPaid >= invoiceTotal ? 'PAID' : 'PARTIAL';

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });
    }
  });

  console.log(`Payment recorded for invoice ${invoiceId}: $${amountInDollars}`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { invoiceId } = paymentIntent.metadata;

  if (!invoiceId) {
    console.error('No invoiceId in payment intent metadata');
    return;
  }

  console.log(
    `Payment failed for invoice ${invoiceId}: ${paymentIntent.last_payment_error?.message}`
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  const plan = session.metadata?.plan;

  if (!tenantId || !plan) {
    console.error('Missing tenantId or plan in checkout session metadata');
    return;
  }

  const subscriptionPlan = stripePlanToSubscriptionPlan(
    // Look up the price from the plan name in metadata
    plan as string
  ) ?? (plan as 'STARTER' | 'PRO' | 'ENTERPRISE');

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionPlan: subscriptionPlan,
      subscriptionStatus: 'ACTIVE',
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripeSubscriptionId: subscriptionId ?? null,
    },
  });

  console.log(`Checkout completed for tenant ${tenantId}: plan=${plan}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!tenant) {
    console.log(`No tenant found for subscription ${subscription.id}`);
    return;
  }

  // Map Stripe status to our enum
  const statusMap: Record<string, 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'PAUSED'> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELLED',
    paused: 'PAUSED',
    unpaid: 'PAST_DUE',
  };

  const newStatus = statusMap[subscription.status] ?? 'ACTIVE';

  // Try to determine the plan from the subscription items
  const priceId = subscription.items.data[0]?.price?.id;
  const newPlan = priceId ? stripePlanToSubscriptionPlan(priceId) : undefined;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: newStatus,
      ...(newPlan ? { subscriptionPlan: newPlan } : {}),
    },
  });

  console.log(`Subscription updated for tenant ${tenant.id}: status=${newStatus}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!tenant) {
    console.log(`No tenant found for deleted subscription ${subscription.id}`);
    return;
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'CANCELLED',
      stripeSubscriptionId: null,
    },
  });

  console.log(`Subscription deleted for tenant ${tenant.id}: reverted to FREE`);
}
