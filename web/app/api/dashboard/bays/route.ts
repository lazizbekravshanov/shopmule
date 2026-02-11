import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { WorkOrderStatus } from '@prisma/client';

interface BayAssignment {
  id: string;
  bayNumber: number;
  status: 'occupied' | 'available' | 'maintenance';
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  workOrder?: {
    id: string;
    description: string;
    status: 'in-progress' | 'waiting-parts' | 'inspection';
    startTime: string;
    estimatedCompletion: string;
  };
  technician?: {
    name: string;
    avatar?: string;
  };
}

// Map WorkOrderStatus to bay status
function mapWorkOrderStatus(status: WorkOrderStatus): 'in-progress' | 'waiting-parts' | 'inspection' {
  switch (status) {
    case WorkOrderStatus.IN_PROGRESS:
      return 'in-progress';
    case WorkOrderStatus.DIAGNOSED:
      return 'inspection';
    case WorkOrderStatus.APPROVED:
      return 'waiting-parts'; // Could be waiting for customer approval or parts
    default:
      return 'in-progress';
  }
}

export async function GET() {
  try {
    // Get shop's bay configuration (default to 6 bays)
    const BAY_COUNT = 6;

    // Get active work orders (in progress, diagnosed, or approved)
    const activeWorkOrders = await prisma.workOrder.findMany({
      where: {
        status: {
          in: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.DIAGNOSED, WorkOrderStatus.APPROVED],
        },
      },
      include: {
        Vehicle: true,
        WorkOrderAssignment: {
          include: {
            EmployeeProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: BAY_COUNT, // Limit to number of bays
    });

    // Build bay assignments
    const bays: BayAssignment[] = [];

    for (let i = 1; i <= BAY_COUNT; i++) {
      const workOrder = activeWorkOrders[i - 1]; // Assign work orders to bays in order

      if (workOrder && workOrder.Vehicle) {
        const technician = workOrder.WorkOrderAssignment?.[0]?.EmployeeProfile;
        const startTime = new Date(workOrder.createdAt);
        const estimatedCompletion = new Date(startTime);
        estimatedCompletion.setHours(estimatedCompletion.getHours() + 4); // Estimate 4 hours per job

        bays.push({
          id: `bay-${i}`,
          bayNumber: i,
          status: 'occupied',
          vehicle: {
            make: workOrder.Vehicle.make || 'Unknown',
            model: workOrder.Vehicle.model || 'Unknown',
            year: workOrder.Vehicle.year || 0,
            licensePlate: workOrder.Vehicle.licensePlate || 'N/A',
          },
          workOrder: {
            id: workOrder.id,
            description: workOrder.description || 'Service',
            status: mapWorkOrderStatus(workOrder.status),
            startTime: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            estimatedCompletion: estimatedCompletion.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          },
          technician: technician ? {
            name: technician.name || 'Unassigned',
            avatar: technician.photoUrl || undefined,
          } : undefined,
        });
      } else {
        // Bay is available
        bays.push({
          id: `bay-${i}`,
          bayNumber: i,
          status: 'available',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: bays,
    });
  } catch (error) {
    console.error('Bays API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bay status' },
      { status: 500 }
    );
  }
}
