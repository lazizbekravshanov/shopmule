import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { hashToken } from '@/lib/tokens';
import {
  successResponse,
  handleApiError,
  notFoundResponse,
  errorResponse,
} from '@/lib/api/response';
import { logAudit } from '@/lib/security/audit';

const createIntentSchema = z.object({
  amount: z.number().positive().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const tokenHash = hashToken(token);

    const body = await request.json();
    const { amount: requestedAmount } = createIntentSchema.parse(body);

    const invoice = await prisma.invoice.findFirst({
      where: {
        portalTokenHash: tokenHash,
      },
      include: {
        Customer: {
          select: {
            name: true,
            email: true,
          },
        },
        Payment: true,
      },
    });

    if (!invoice) {
      return notFoundResponse('Invoice not found or link has expired');
    }

    if (
      invoice.portalTokenExpiresAt &&
      new Date() > invoice.portalTokenExpiresAt
    ) {
      return errorResponse('Payment link has expired', 410, 'LINK_EXPIRED');
    }

    if (invoice.status === 'PAID') {
      return errorResponse('Invoice is already paid', 400, 'ALREADY_PAID');
    }

    const paidAmount = invoice.Payment.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const remainingBalance = Number(invoice.total) - paidAmount;

    if (remainingBalance <= 0) {
      return errorResponse('No remaining balance on invoice', 400, 'NO_BALANCE');
    }

    const paymentAmount = requestedAmount
      ? Math.min(requestedAmount, remainingBalance)
      : remainingBalance;

    const amountInCents = Math.round(paymentAmount * 100);
    const customerName = invoice.Customer?.name || 'Customer';

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        customerName,
        source: 'customer_portal',
      },
      description: `Payment for Invoice #${invoice.id.slice(0, 8)}`,
      receipt_email: invoice.Customer?.email || undefined,
    });

    // Audit log: Payment intent created
    await logAudit({
      action: 'PAYMENT',
      entityType: 'Invoice',
      entityId: invoice.id,
      metadata: {
        paymentIntentId: paymentIntent.id,
        amount: paymentAmount,
        remainingBalance,
        customerId: invoice.customerId,
        customerEmail: invoice.Customer?.email,
        source: 'customer_portal',
      },
    });

    return successResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentAmount,
      remainingBalance,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
