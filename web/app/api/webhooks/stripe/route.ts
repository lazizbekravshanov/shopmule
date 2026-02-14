import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

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
