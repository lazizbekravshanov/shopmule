'use client';

import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkOrderStatus = 'DIAGNOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';

interface WorkOrderTimelineProps {
  status: WorkOrderStatus;
}

const steps: { status: WorkOrderStatus; label: string }[] = [
  { status: 'DIAGNOSED', label: 'Diagnosed' },
  { status: 'APPROVED', label: 'Approved' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'COMPLETED', label: 'Completed' },
];

const statusOrder: Record<WorkOrderStatus, number> = {
  DIAGNOSED: 0,
  APPROVED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

export function WorkOrderTimeline({ status }: WorkOrderTimelineProps) {
  const currentIndex = statusOrder[status];

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.status} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  isComplete && 'bg-green-500 text-white',
                  isCurrent && 'bg-[#ee7a14] text-white',
                  !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 text-center',
                  isCurrent && 'font-semibold text-[#ee7a14]',
                  isComplete && 'text-green-600',
                  !isComplete && !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2',
                  index < currentIndex ? 'bg-green-500' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
