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
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        repairOrder: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                plate: true,
                vin: true,
              },
            },
            laborLines: {
              select: {
                id: true,
                description: true,
                hours: true,
                rate: true,
              },
            },
            partLines: {
              include: {
                part: {
                  select: {
                    id: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
          },
          orderBy: {
            paidAt: 'desc',
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

    const paidAmount = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const remainingBalance = Number(invoice.total) - paidAmount;

    const laborLines = invoice.repairOrder?.laborLines.map((line) => ({
      id: line.id,
      description: line.description,
      hours: Number(line.hours),
      rate: Number(line.rate),
      total: Number(line.hours) * Number(line.rate),
    })) || [];

    const partLines = invoice.repairOrder?.partLines.map((line) => ({
      id: line.id,
      description: line.part?.description || 'Part',
      qty: line.qty,
      unitPrice: Number(line.unitPrice),
      total: line.qty * Number(line.unitPrice),
    })) || [];

    const laborTotal = laborLines.reduce((sum, line) => sum + line.total, 0);
    const partsTotal = partLines.reduce((sum, line) => sum + line.total, 0);

    return successResponse({
      id: invoice.id,
      status: invoice.status,
      total: Number(invoice.total),
      paidAmount,
      remainingBalance,
      issuedAt: invoice.issuedAt.toISOString(),
      shop: invoice.shop,
      customer: invoice.repairOrder?.customer,
      vehicle: invoice.repairOrder?.vehicle,
      laborLines,
      partLines,
      laborTotal,
      partsTotal,
      payments: invoice.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
        paidAt: p.paidAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
