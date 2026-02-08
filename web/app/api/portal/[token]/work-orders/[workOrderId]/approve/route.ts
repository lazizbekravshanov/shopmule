import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/tokens';
import {
  successResponse,
  handleApiError,
  notFoundResponse,
  errorResponse,
} from '@/lib/api/response';
import { logAudit } from '@/lib/security/audit';

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

    if (workOrder.status !== 'DIAGNOSED') {
      return errorResponse(
        `Work order cannot be approved (current status: ${workOrder.status})`,
        400,
        'INVALID_STATUS'
      );
    }

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'APPROVED' },
    });

    await prisma.customer.update({
      where: { id: customer.id },
      data: { portalLastAccessedAt: new Date() },
    });

    // Audit log: Customer approved estimate via portal
    await logAudit({
      action: 'APPROVE',
      entityType: 'WorkOrder',
      entityId: workOrderId,
      oldValues: { status: workOrder.status },
      newValues: { status: 'APPROVED' },
      metadata: {
        customerId: customer.id,
        customerEmail: customer.email,
        vehicleId: workOrder.Vehicle?.id,
        approvedViaPortal: true,
      },
    });

    return successResponse({
      id: updatedWorkOrder.id,
      status: updatedWorkOrder.status,
      message: 'Estimate approved successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
