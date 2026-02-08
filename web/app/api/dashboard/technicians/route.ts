import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role, PunchType, WorkOrderStatus, Prisma } from '@prisma/client';

type TechnicianWithRelations = Prisma.EmployeeProfileGetPayload<{
  include: {
    PunchRecord: true;
    WorkOrderAssignment: {
      include: {
        WorkOrder: {
          include: {
            Vehicle: true;
          };
        };
      };
    };
    WorkOrderLabor: true;
  };
}>;

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all technicians (MECHANIC role)
    const technicians = await prisma.employeeProfile.findMany({
      where: {
        role: Role.MECHANIC,
        status: 'active',
      },
      include: {
        PunchRecord: {
          where: {
            timestamp: {
              gte: today,
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
        WorkOrderAssignment: {
          include: {
            WorkOrder: {
              include: {
                Vehicle: true,
              },
            },
          },
        },
        WorkOrderLabor: {
          where: {
            WorkOrder: {
              updatedAt: {
                gte: today,
              },
              status: WorkOrderStatus.COMPLETED,
            },
          },
        },
      },
    });

    const techStatus = technicians.map((tech: TechnicianWithRelations) => {
      // Determine clock status from punch records
      const punches = tech.PunchRecord;
      let status: 'clocked-in' | 'on-break' | 'clocked-out' = 'clocked-out';
      let clockInTime: string | null = null;
      let hoursToday = 0;

      if (punches.length > 0) {
        const lastPunch = punches[0];
        if (lastPunch.type === PunchType.CLOCK_IN) {
          status = 'clocked-in';
          clockInTime = lastPunch.timestamp.toISOString();
          // Calculate hours since clock in
          hoursToday = (Date.now() - lastPunch.timestamp.getTime()) / (1000 * 60 * 60);
        } else if (lastPunch.type === PunchType.BREAK_START) {
          status = 'on-break';
          // Find clock in time
          const clockIn = punches.find((p: typeof lastPunch) => p.type === PunchType.CLOCK_IN);
          if (clockIn) {
            clockInTime = clockIn.timestamp.toISOString();
          }
        } else if (lastPunch.type === PunchType.CLOCK_OUT) {
          // Find total hours from clock in to clock out
          const clockIn = punches.find((p: typeof lastPunch) => p.type === PunchType.CLOCK_IN);
          if (clockIn) {
            hoursToday = (lastPunch.timestamp.getTime() - clockIn.timestamp.getTime()) / (1000 * 60 * 60);
          }
        }
      }

      // Get current job
      const currentJob = tech.WorkOrderAssignment.find(
        (a: (typeof tech.WorkOrderAssignment)[0]) => a.WorkOrder?.status === WorkOrderStatus.IN_PROGRESS
      );

      // Count completed jobs today
      const jobsCompleted = tech.WorkOrderLabor.length;

      return {
        id: tech.id,
        name: tech.name,
        photoUrl: tech.photoUrl,
        status,
        currentJob: currentJob
          ? `${currentJob.WorkOrder?.Vehicle?.make} ${currentJob.WorkOrder?.Vehicle?.model}`
          : status === 'clocked-in' ? 'Available' : null,
        workOrderId: currentJob?.WorkOrder?.id || null,
        hoursToday: Math.round(hoursToday * 10) / 10,
        jobsCompleted,
        clockInTime,
      };
    });

    return NextResponse.json({ success: true, data: techStatus });
  } catch (error) {
    console.error('Technicians API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technician status' },
      { status: 500 }
    );
  }
}
