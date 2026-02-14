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
    Assignments: {
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
        Assignments: {
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
      // Use actual createdAt time, formatted for display
      const createdDate = new Date(wo.createdAt);
      const hours = createdDate.getHours();
      const minutes = createdDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      const time = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;

      // Safely build vehicle string with fallbacks
      const vehicleYear = wo.Vehicle?.year ?? '';
      const vehicleMake = wo.Vehicle?.make ?? '';
      const vehicleModel = wo.Vehicle?.model ?? '';
      const vehicleStr = [vehicleYear, vehicleMake, vehicleModel].filter(Boolean).join(' ') || 'Unknown Vehicle';

      return {
        id: wo.id,
        time,
        customer: wo.Vehicle?.Customer?.name || 'Unknown Customer',
        vehicle: vehicleStr,
        type: wo.description?.split(' ').slice(0, 3).join(' ') || 'Service',
        status: wo.status,
        technician: wo.Assignments[0]?.EmployeeProfile?.name || 'Unassigned',
        bay: `Bay ${(index % 4) + 1}`,
        createdAt: wo.createdAt,
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
