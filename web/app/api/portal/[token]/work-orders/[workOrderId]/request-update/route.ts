import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/tokens';
import {
  successResponse,
  handleApiError,
  notFoundResponse,
  errorResponse,
} from '@/lib/api/response';

const requestUpdateSchema = z.object({
  message: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; workOrderId: string }> }
) {
  try {
    const { token, workOrderId } = await params;
    const tokenHash = hashToken(token);

    const customer = await prisma.customer.findFirst({
      where: {
        portalTokenHash: tokenHash,
      },
    });

    if (!customer) {
      return notFoundResponse('Portal not found or link has expired');
    }

    if (
      customer.portalTokenExpiresAt &&
      new Date() > customer.portalTokenExpiresAt
    ) {
      return errorResponse('Portal link has expired', 410, 'LINK_EXPIRED');
    }

    const body = await request.json();
    const { message } = requestUpdateSchema.parse(body);

    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        Vehicle: {
          customerId: customer.id,
        },
      },
      include: {
        Vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
          },
        },
      },
    });

    if (!workOrder) {
      return notFoundResponse('Work order not found');
    }

    const timestamp = new Date().toISOString();
    const updateNote = message
      ? `[${timestamp}] Customer requested update: ${message}`
      : `[${timestamp}] Customer requested status update`;

    const existingNotes = workOrder.notes || '';
    const newNotes = existingNotes
      ? `${existingNotes}\n\n${updateNote}`
      : updateNote;

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { notes: newNotes },
    });

    await prisma.customer.update({
      where: { id: customer.id },
      data: { portalLastAccessedAt: new Date() },
    });

    return successResponse({
      message: 'Update request submitted successfully',
      workOrderId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
