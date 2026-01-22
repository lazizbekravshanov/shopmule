import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateToken, hashToken, generatePaymentLink } from '@/lib/tokens';
import {
  successResponse,
  handleApiError,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
} from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        repairOrder: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!invoice) {
      return notFoundResponse('Invoice not found');
    }

    if (invoice.shopId !== session.user.shopId) {
      return notFoundResponse('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      return errorResponse('Invoice is already paid', 400, 'ALREADY_PAID');
    }

    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.invoice.update({
      where: { id },
      data: {
        portalTokenHash: tokenHash,
        portalTokenExpiresAt: expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const paymentLink = generatePaymentLink(baseUrl, token);

    return successResponse({
      paymentLink,
      expiresAt: expiresAt.toISOString(),
      customerEmail: invoice.repairOrder?.customer?.email,
      customerPhone: invoice.repairOrder?.customer?.phone,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
