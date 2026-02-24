'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users,
  Clock,
  Wrench,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Circle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TechnicianStatus {
  id: string;
  name: string;
  photoUrl: string | null;
  status: 'clocked-in' | 'on-break' | 'clocked-out';
  currentJob: string | null;
  workOrderId: string | null;
  hoursToday: number;
  jobsCompleted: number;
  clockInTime: string | null;
}

const statusConfig = {
  'clocked-in': {
    label: 'Active',
    color: 'bg-green-500',
    textColor: 'text-green-600 dark:text-green-400',
    icon: Circle,
  },
  'on-break': {
    label: 'Break',
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    icon: Coffee,
  },
  'clocked-out': {
    label: 'Off',
    color: 'bg-neutral-300 dark:bg-neutral-600',
    textColor: 'text-neutral-500 dark:text-neutral-400',
    icon: Circle,
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TechnicianStatusBoard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'technicians'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/technicians');
      if (!res.ok) {
        throw new Error(`Failed to fetch technicians: ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch technicians');
      }
      return json.data as TechnicianStatus[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data fresh for 15 seconds
    retry: 2,
  });

  const technicians = data || [];
  const activeCount = technicians.filter((t) => t.status === 'clocked-in').length;

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            <Users className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Technician Status
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {activeCount} of {technicians.length} active
            </p>
          </div>
        </div>
        <Link
          href="/technicians"
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 flex items-center gap-1 transition-colors"
        >
          Manage
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Technician Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Failed to load technicians
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
        ) : technicians.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No technicians found
            </p>
            <Link
              href="/technicians"
              className="text-sm font-medium text-[#ee7a14] hover:underline mt-2 inline-block"
            >
              Add technician
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {technicians.map((tech) => {
              const config = statusConfig[tech.status];
              return (
                <div
                  key={tech.id}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    tech.status === 'clocked-in'
                      ? 'border-neutral-200 dark:border-neutral-700'
                      : 'border-neutral-100 dark:border-neutral-700'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {tech.photoUrl ? (
                        <img
                          src={tech.photoUrl}
                          alt={tech.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-sm font-medium text-neutral-600 dark:text-neutral-300">
                          {getInitials(tech.name)}
                        </div>
                      )}
                      {/* Status indicator */}
                      <div
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-800',
                          config.color
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {tech.name}
                        </p>
                        <span className={cn('text-[10px] font-medium', config.textColor)}>
                          {config.label}
                        </span>
                      </div>

                      {tech.currentJob ? (
                        <Link
                          href={tech.workOrderId ? `/work-orders/${tech.workOrderId}` : '#'}
                          className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-[#ee7a14] flex items-center gap-1 mt-0.5 truncate"
                          title={tech.currentJob}
                        >
                          <Wrench className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{tech.currentJob}</span>
                        </Link>
                      ) : tech.status === 'clocked-out' ? (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                          Not clocked in
                        </p>
                      ) : null}

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-400 dark:text-neutral-500">
                        {tech.clockInTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(tech.clockInTime)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tech.hoursToday}h
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {tech.jobsCompleted} done
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
