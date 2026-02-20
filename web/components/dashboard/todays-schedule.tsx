'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Car,
  MapPin,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  id: string;
  time: string;
  customer: string;
  vehicle: string;
  type: string;
  status: 'DIAGNOSED' | 'APPROVED' | 'IN_PROGRESS';
  technician: string;
  bay: string;
}

const statusConfig = {
  DIAGNOSED: { label: 'Pending', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' },
  APPROVED: { label: 'Ready', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  IN_PROGRESS: { label: 'Active', color: 'bg-[#ee7a14]/10 text-[#ee7a14]' },
};

export function TodaysSchedule() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard', 'schedule'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/schedule');
      if (!res.ok) {
        throw new Error(`Failed to fetch schedule: ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch schedule');
      }
      return json.data as ScheduleItem[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
    retry: 2,
  });

  const schedule = data || [];

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Today&apos;s Schedule
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <Link
          href="/work-orders"
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 flex items-center gap-1 transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Schedule List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="px-5 py-10 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Failed to load schedule
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </Button>
          </div>
        ) : schedule.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Calendar className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No jobs scheduled for today
            </p>
            <Link
              href="/work-orders/new"
              className="text-sm font-medium text-[#ee7a14] hover:underline mt-2 inline-block"
            >
              Create work order
            </Link>
          </div>
        ) : (
          schedule.map((item) => {
            const config = statusConfig[item.status];
            return (
              <Link
                key={item.id}
                href={`/work-orders/${item.id}`}
                className="block px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Time */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.time}
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center justify-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.bay}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {item.customer}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1 truncate">
                        <Car className="w-3 h-3 flex-shrink-0" />
                        {item.vehicle}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <User className="w-3 h-3 flex-shrink-0" />
                        {item.technician}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 truncate">
                      {item.type}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <Badge className={cn('text-[10px] px-2 py-0.5', config.color)}>
                    {config.label}
                  </Badge>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
