import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateToken, hashToken, generatePaymentLink } from '@/lib/tokens';
import { isValidId } from '@/lib/security';
import {
  sendPaymentLinkNotification,
  type NotificationChannel,
} from '@/lib/services/notifications';
import {
  successResponse,
  handleApiError,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
} from '@/lib/api/response';

const sendPaymentLinkSchema = z.object({
  channels: z
    .array(z.enum(['email', 'sms']))
    .min(1, 'At least one channel is required'),
  customMessage: z.string().max(500).optional(),
});

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

    if (!isValidId(id)) {
      return errorResponse('Invalid invoice ID', 400, 'INVALID_ID');
    }

    const body = await request.json();
    const parsed = sendPaymentLinkSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { channels, customMessage } = parsed.data;

    // Fetch invoice with customer and work order details
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        Customer: true,
        WorkOrder: {
          include: {
            Vehicle: true,
          },
        },
      },
    });

    if (!invoice) {
      return notFoundResponse('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      return errorResponse('Invoice is already paid', 400, 'ALREADY_PAID');
    }

    // Generate payment link token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Update invoice with portal token
    await prisma.invoice.update({
      where: { id },
      data: {
        portalTokenHash: tokenHash,
        portalTokenExpiresAt: expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const paymentLink = generatePaymentLink(baseUrl, token);

    // Prepare vehicle info string
    const vehicle = invoice.WorkOrder?.Vehicle;
    const vehicleInfo = vehicle
      ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim()
      : 'Vehicle';

    // Send notifications
    const notificationResult = await sendPaymentLinkNotification({
      channels: channels as NotificationChannel[],
      customerEmail: invoice.Customer?.email,
      customerPhone: invoice.Customer?.phone,
      customerName: invoice.Customer?.name || 'Customer',
      vehicleInfo,
      paymentLink,
      totalAmount: invoice.total,
      customMessage,
    });

    if (!notificationResult.success && notificationResult.errors.length > 0) {
      return errorResponse(
        `Failed to send notification: ${notificationResult.errors.join(', ')}`,
        500,
        'NOTIFICATION_FAILED'
      );
    }

    return successResponse({
      paymentLink,
      expiresAt: expiresAt.toISOString(),
      sentTo: notificationResult.sentTo,
      channels: {
        email: notificationResult.email,
        sms: notificationResult.sms,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
