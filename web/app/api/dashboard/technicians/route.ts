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

        // Find the most recent clock in (to calculate hours accurately)
        const clockIn = punches.find((p: typeof lastPunch) => p.type === PunchType.CLOCK_IN);

        if (lastPunch.type === PunchType.CLOCK_IN) {
          status = 'clocked-in';
          clockInTime = lastPunch.timestamp.toISOString();
          // Calculate hours since clock in
          hoursToday = (Date.now() - lastPunch.timestamp.getTime()) / (1000 * 60 * 60);
        } else if (lastPunch.type === PunchType.BREAK_START) {
          status = 'on-break';
          if (clockIn) {
            clockInTime = clockIn.timestamp.toISOString();
            // Hours worked = time from clock in to break start
            hoursToday = (lastPunch.timestamp.getTime() - clockIn.timestamp.getTime()) / (1000 * 60 * 60);
          }
        } else if (lastPunch.type === PunchType.BREAK_END) {
          // Back from break = clocked in
          status = 'clocked-in';
          if (clockIn) {
            clockInTime = clockIn.timestamp.toISOString();
            // Find break start to calculate break duration
            const breakStart = punches.find((p: typeof lastPunch) => p.type === PunchType.BREAK_START);
            const breakDuration = breakStart
              ? (lastPunch.timestamp.getTime() - breakStart.timestamp.getTime()) / (1000 * 60 * 60)
              : 0;
            // Total hours = now - clock in - break duration
            hoursToday = (Date.now() - clockIn.timestamp.getTime()) / (1000 * 60 * 60) - breakDuration;
          }
        } else if (lastPunch.type === PunchType.CLOCK_OUT) {
          status = 'clocked-out';
          if (clockIn) {
            // Find any breaks to subtract
            const breakStart = punches.find((p: typeof lastPunch) => p.type === PunchType.BREAK_START);
            const breakEnd = punches.find((p: typeof lastPunch) => p.type === PunchType.BREAK_END);
            const breakDuration = (breakStart && breakEnd)
              ? (breakEnd.timestamp.getTime() - breakStart.timestamp.getTime()) / (1000 * 60 * 60)
              : 0;
            hoursToday = (lastPunch.timestamp.getTime() - clockIn.timestamp.getTime()) / (1000 * 60 * 60) - breakDuration;
          }
        }
      }

      // Get current job
      const currentJob = tech.WorkOrderAssignment.find(
        (a: (typeof tech.WorkOrderAssignment)[0]) => a.WorkOrder?.status === WorkOrderStatus.IN_PROGRESS
      );

      // Build current job display string with safe fallbacks
      let currentJobDisplay: string | null = null;
      if (currentJob?.WorkOrder?.Vehicle) {
        const make = currentJob.WorkOrder.Vehicle.make || '';
        const model = currentJob.WorkOrder.Vehicle.model || '';
        currentJobDisplay = [make, model].filter(Boolean).join(' ') || 'Unknown Vehicle';
      } else if (status === 'clocked-in') {
        currentJobDisplay = 'Available';
      }

      // Count completed jobs today
      const jobsCompleted = tech.WorkOrderLabor.length;

      return {
        id: tech.id,
        name: tech.name,
        photoUrl: tech.photoUrl,
        status,
        currentJob: currentJobDisplay,
        workOrderId: currentJob?.WorkOrder?.id || null,
        hoursToday: Math.round(hoursToday * 100) / 100, // 2 decimal places for accuracy
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
