import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import {
  successResponse,
  errorResponse,
  handleApiError,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api/response';

const createIntentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { invoiceId, amount: requestedAmount } = createIntentSchema.parse(body);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        LegacyPayments: true,
        Customer: true,
      },
    });

    if (!invoice) {
      return notFoundResponse('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      return errorResponse('Invoice is already paid', 400, 'ALREADY_PAID');
    }

    const paidAmount = invoice.LegacyPayments.reduce(
      (sum: number, p: { amount: number }) => sum + Number(p.amount),
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

    const customerName = invoice.Customer?.name || 'Unknown';

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        customerName,
      },
      description: `Payment for Invoice #${invoice.id.slice(0, 8)}`,
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
