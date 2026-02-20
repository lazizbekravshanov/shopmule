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

    const customer = await prisma.customer.findFirst({
      where: {
        portalTokenHash: tokenHash,
      },
      include: {
        Vehicles: {
          include: {
            WorkOrders: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        Invoices: {
          include: {
            LegacyPayments: {
              select: {
                id: true,
                amount: true,
                method: true,
                receivedAt: true,
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
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
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

    await prisma.customer.update({
      where: { id: customer.id },
      data: { portalLastAccessedAt: new Date() },
    });

    const allWorkOrders = await prisma.workOrder.findMany({
      where: {
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
            licensePlate: true,
          },
        },
        Invoice: {
          select: {
            id: true,
            status: true,
            total: true,
            portalTokenHash: true,
          },
        },
        Labor: {
          select: {
            id: true,
            note: true,
            hours: true,
            rate: true,
          },
        },
        Parts: {
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
      orderBy: { createdAt: 'desc' },
    });

    const vehicles = customer.Vehicles.map((v: any) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year,
      licensePlate: v.licensePlate,
      vin: v.vin,
      unitNumber: v.unitNumber,
      mileage: v.currentMileage,
      lastServiceDate: v.WorkOrders[0]?.createdAt?.toISOString() || null,
    }));

    const workOrders = allWorkOrders.map((wo: any) => ({
      id: wo.id,
      status: wo.status,
      description: wo.description,
      notes: wo.notes,
      checklist: wo.checklist ?? null,
      createdAt: wo.createdAt.toISOString(),
      updatedAt: wo.updatedAt.toISOString(),
      vehicle: wo.Vehicle,
      laborTotal: wo.Labor.reduce(
        (sum: number, l: any) => sum + Number(l.hours) * Number(l.rate),
        0
      ),
      partsTotal: wo.Parts.reduce(
        (sum: number, p: any) => sum + p.quantity * Number(p.unitPrice) * (1 + p.markupPct),
        0
      ),
      laborLines: wo.Labor.map((l: any) => ({
        id: l.id,
        description: l.note || 'Labor',
        hours: Number(l.hours),
        rate: Number(l.rate),
        total: Number(l.hours) * Number(l.rate),
      })),
      partLines: wo.Parts.map((p: any) => ({
        id: p.id,
        description: p.Part?.name || 'Part',
        quantity: p.quantity,
        unitPrice: Number(p.unitPrice),
        total: p.quantity * Number(p.unitPrice) * (1 + p.markupPct),
      })),
      hasInvoice: !!wo.Invoice,
      invoiceId: wo.Invoice?.id || null,
      invoiceStatus: wo.Invoice?.status || null,
    }));

    const invoices = customer.Invoices.map((inv: any) => {
      const paidAmount = inv.LegacyPayments.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );
      return {
        id: inv.id,
        status: inv.status,
        total: Number(inv.total),
        paidAmount,
        remainingBalance: Number(inv.total) - paidAmount,
        createdAt: inv.createdAt.toISOString(),
        vehicle: inv.WorkOrder?.Vehicle || null,
        hasPaymentLink: !!inv.portalTokenHash,
      };
    });

    const activeWorkOrders = workOrders.filter(
      (wo: any) => wo.status !== 'COMPLETED'
    );
    const unpaidBalance = invoices
      .filter((inv: any) => inv.status !== 'PAID')
      .reduce((sum: number, inv: any) => sum + inv.remainingBalance, 0);

    return successResponse({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      summary: {
        activeWorkOrders: activeWorkOrders.length,
        totalVehicles: vehicles.length,
        unpaidBalance,
      },
      vehicles,
      workOrders,
      invoices,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
