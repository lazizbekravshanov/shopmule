'use client';

import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Car, Wrench, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Appointment {
  id: string;
  time: string;
  customer: string;
  vehicle: string;
  service: string;
  technician: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

interface AppointmentDetailSheetProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  scheduled: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Scheduled' },
  'in-progress': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'In Progress' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Completed' },
};

export function AppointmentDetailSheet({ appointment, open, onOpenChange }: AppointmentDetailSheetProps) {
  const router = useRouter();

  if (!appointment) return null;

  const status = statusConfig[appointment.status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl font-semibold text-neutral-900 dark:text-white">
              Appointment Details
            </SheetTitle>
            <Badge className={cn('text-xs px-2 py-0.5', status.bg, status.text)}>
              {status.label}
            </Badge>
          </div>
          <SheetDescription className="text-neutral-500 dark:text-neutral-400">
            {appointment.service}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-2" />

        <div className="space-y-6 pt-4">
          {/* Time */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Time</p>
              <p className="text-base font-semibold text-neutral-900 dark:text-white">{appointment.time}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Customer</p>
              <p className="text-base font-semibold text-neutral-900 dark:text-white">{appointment.customer}</p>
            </div>
          </div>

          {/* Vehicle */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Vehicle</p>
              <p className="text-base font-semibold text-neutral-900 dark:text-white">{appointment.vehicle}</p>
            </div>
          </div>

          {/* Technician */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Technician</p>
              <p className="text-base font-semibold text-neutral-900 dark:text-white">{appointment.technician}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => {
              router.push(`/work-orders/${appointment.id}`);
              onOpenChange(false);
            }}
            className="w-full bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0 rounded-xl"
          >
            View Work Order
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
