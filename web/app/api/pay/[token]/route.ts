import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/tokens';
import {
  successResponse,
  handleApiError,
  notFoundResponse,
  errorResponse,
} from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const tokenHash = hashToken(token);

    const invoice = await prisma.invoice.findFirst({
      where: {
        portalTokenHash: tokenHash,
      },
      include: {
        Customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        WorkOrder: {
          include: {
            Vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                licensePlate: true,
                vin: true,
              },
            },
            WorkOrderLabor: {
              select: {
                id: true,
                note: true,
                hours: true,
                rate: true,
              },
            },
            WorkOrderPart: {
              include: {
                Part: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        Payment: {
          select: {
            id: true,
            amount: true,
            method: true,
            receivedAt: true,
          },
          orderBy: {
            receivedAt: 'desc',
          },
        },
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

    if (!invoice.portalViewedAt) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { portalViewedAt: new Date() },
      });
    }

    const paidAmount = invoice.Payment.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const remainingBalance = Number(invoice.total) - paidAmount;

    const laborLines = invoice.WorkOrder?.WorkOrderLabor.map((line) => ({
      id: line.id,
      description: line.note || 'Labor',
      hours: Number(line.hours),
      rate: Number(line.rate),
      total: Number(line.hours) * Number(line.rate),
    })) || [];

    const partLines = invoice.WorkOrder?.WorkOrderPart.map((line) => ({
      id: line.id,
      description: line.Part?.name || 'Part',
      qty: line.quantity,
      unitPrice: Number(line.unitPrice),
      total: line.quantity * Number(line.unitPrice) * (1 + line.markupPct),
    })) || [];

    const laborTotal = laborLines.reduce((sum, line) => sum + line.total, 0);
    const partsTotal = partLines.reduce((sum, line) => sum + line.total, 0);

    return successResponse({
      id: invoice.id,
      status: invoice.status,
      total: Number(invoice.total),
      subtotalParts: Number(invoice.subtotalParts),
      subtotalLabor: Number(invoice.subtotalLabor),
      tax: Number(invoice.tax),
      discount: Number(invoice.discount),
      paidAmount,
      remainingBalance,
      createdAt: invoice.createdAt.toISOString(),
      customer: invoice.Customer,
      vehicle: invoice.WorkOrder?.Vehicle,
      laborLines,
      partLines,
      laborTotal,
      partsTotal,
      payments: invoice.Payment.map((p) => ({
        ...p,
        amount: Number(p.amount),
        paidAt: p.receivedAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
