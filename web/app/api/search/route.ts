import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type CustomerResult = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
};

type VehicleResult = {
  id: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  licensePlate: string | null;
  customer: { firstName: string; lastName: string } | null;
};

type WorkOrderResult = {
  id: string;
  orderNumber: string;
  status: string;
  vehicle: { make: string; model: string; year: number } | null;
  customer: { firstName: string; lastName: string } | null;
};

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ customers: [], vehicles: [], workOrders: [] });
  }

  const searchTerm = query.toLowerCase();

  // Search customers
  const customers: CustomerResult[] = await prisma.customer.findMany({
    where: {
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
        { company: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
    },
  });

  // Search vehicles
  const vehicles: VehicleResult[] = await prisma.vehicle.findMany({
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
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Search work orders
  const workOrders: WorkOrderResult[] = await prisma.workOrder.findMany({
    where: {
      OR: [
        { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { vehicle: { make: { contains: searchTerm, mode: 'insensitive' } } },
        { vehicle: { model: { contains: searchTerm, mode: 'insensitive' } } },
        { customer: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
        { customer: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
      ],
    },
    take: 5,
    include: {
      vehicle: {
        select: {
          make: true,
          model: true,
          year: true,
        },
      },
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return NextResponse.json({
    customers: customers.map((c: CustomerResult) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      company: c.company,
    })),
    vehicles: vehicles.map((v: VehicleResult) => ({
      id: v.id,
      name: `${v.year} ${v.make} ${v.model}`,
      vin: v.vin,
      licensePlate: v.licensePlate,
      customer: v.customer ? `${v.customer.firstName} ${v.customer.lastName}` : null,
    })),
    workOrders: workOrders.map((wo: WorkOrderResult) => ({
      id: wo.id,
      orderNumber: wo.orderNumber,
      status: wo.status,
      vehicle: wo.vehicle ? `${wo.vehicle.year} ${wo.vehicle.make} ${wo.vehicle.model}` : null,
      customer: wo.customer ? `${wo.customer.firstName} ${wo.customer.lastName}` : null,
    })),
  });
}
