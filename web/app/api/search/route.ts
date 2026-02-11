import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface SearchResult {
  id: string;
  type: 'customer' | 'vehicle' | 'work_order' | 'invoice' | 'part';
  title: string;
  subtitle?: string;
  href: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search in parallel for better performance
    const [customers, vehicles, workOrders, invoices, parts] = await Promise.all([
      // Search customers
      prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
            { contactName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      }),

      // Search vehicles
      prisma.vehicle.findMany({
        where: {
          OR: [
            { make: { contains: searchTerm, mode: 'insensitive' } },
            { model: { contains: searchTerm, mode: 'insensitive' } },
            { vin: { contains: searchTerm, mode: 'insensitive' } },
            { licensePlate: { contains: searchTerm, mode: 'insensitive' } },
            { unitNumber: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: {
          Customer: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Search work orders
      prisma.workOrder.findMany({
        where: {
          OR: [
            { id: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { notes: { contains: searchTerm, mode: 'insensitive' } },
            { Vehicle: { make: { contains: searchTerm, mode: 'insensitive' } } },
            { Vehicle: { model: { contains: searchTerm, mode: 'insensitive' } } },
            { Vehicle: { Customer: { name: { contains: searchTerm, mode: 'insensitive' } } } },
          ],
        },
        take: 5,
        include: {
          Vehicle: {
            select: {
              year: true,
              make: true,
              model: true,
              Customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      // Search invoices
      prisma.invoice.findMany({
        where: {
          OR: [
            { id: { contains: searchTerm, mode: 'insensitive' } },
            { Customer: { name: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
        take: 5,
        include: {
          Customer: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Search parts/inventory
      prisma.part.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { sku: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
        },
      }),
    ]);

    // Format customers
    for (const customer of customers) {
      results.push({
        id: customer.id,
        type: 'customer',
        title: customer.name,
        subtitle: customer.email || customer.phone || undefined,
        href: `/customers?id=${customer.id}`,
      });
    }

    // Format vehicles
    for (const vehicle of vehicles) {
      const vehicleName = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim();
      results.push({
        id: vehicle.id,
        type: 'vehicle',
        title: vehicleName || 'Unknown Vehicle',
        subtitle: vehicle.Customer?.name || vehicle.licensePlate || vehicle.vin,
        href: `/customers?vehicle=${vehicle.id}`,
      });
    }

    // Format work orders
    for (const wo of workOrders) {
      const vehicleInfo = wo.Vehicle
        ? `${wo.Vehicle.year || ''} ${wo.Vehicle.make || ''} ${wo.Vehicle.model || ''}`.trim()
        : '';
      const customerName = wo.Vehicle?.Customer?.name || '';
      results.push({
        id: wo.id,
        type: 'work_order',
        title: `WO: ${wo.description?.substring(0, 40) || 'Work Order'}${wo.description && wo.description.length > 40 ? '...' : ''}`,
        subtitle: [customerName, vehicleInfo].filter(Boolean).join(' - ') || undefined,
        href: `/work-orders/${wo.id}`,
      });
    }

    // Format invoices
    for (const invoice of invoices) {
      results.push({
        id: invoice.id,
        type: 'invoice',
        title: `Invoice: $${invoice.total.toFixed(2)}`,
        subtitle: invoice.Customer?.name || undefined,
        href: `/invoices/${invoice.id}`,
      });
    }

    // Format parts
    for (const part of parts) {
      results.push({
        id: part.id,
        type: 'part',
        title: part.name,
        subtitle: `SKU: ${part.sku} | Stock: ${part.stock}`,
        href: `/inventory?id=${part.id}`,
      });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('[Search Error]', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
