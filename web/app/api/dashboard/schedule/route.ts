import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { WorkOrderStatus, Prisma } from '@prisma/client';

type WorkOrderWithRelations = Prisma.WorkOrderGetPayload<{
  include: {
    Vehicle: {
      include: {
        Customer: true;
      };
    };
    WorkOrderAssignment: {
      include: {
        EmployeeProfile: true;
      };
    };
  };
}>;

export async function GET() {
  try {
    // Get work orders that are active (not completed)
    const workOrders = await prisma.workOrder.findMany({
      where: {
        status: {
          in: [WorkOrderStatus.DIAGNOSED, WorkOrderStatus.APPROVED, WorkOrderStatus.IN_PROGRESS],
        },
      },
      include: {
        Vehicle: {
          include: {
            Customer: true,
          },
        },
        WorkOrderAssignment: {
          include: {
            EmployeeProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 10,
    });

    const schedule = workOrders.map((wo: WorkOrderWithRelations, index: number) => {
      // Simulate time slots based on order
      const baseHour = 8 + Math.floor(index / 2);
      const minutes = (index % 2) * 30;
      const time = `${baseHour > 12 ? baseHour - 12 : baseHour}:${minutes === 0 ? '00' : '30'} ${baseHour >= 12 ? 'PM' : 'AM'}`;

      return {
        id: wo.id,
        time,
        customer: wo.Vehicle.Customer?.name || 'Unknown Customer',
        vehicle: `${wo.Vehicle.year || ''} ${wo.Vehicle.make} ${wo.Vehicle.model}`.trim(),
        type: wo.description.split(' ').slice(0, 3).join(' '),
        status: wo.status,
        technician: wo.WorkOrderAssignment[0]?.EmployeeProfile?.name || 'Unassigned',
        bay: `Bay ${(index % 4) + 1}`,
      };
    });

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Schedule API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}
