'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  Wrench,
  CheckCircle2,
  DollarSign,
  FileText,
  CreditCard,
  UserPlus,
  LogIn,
  LogOut,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'work_order' | 'invoice' | 'payment' | 'customer' | 'technician';
  action: string;
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  icon?: string;
}

const iconMap: Record<string, React.ElementType> = {
  'wrench': Wrench,
  'check-circle': CheckCircle2,
  'dollar-sign': DollarSign,
  'file-text': FileText,
  'credit-card': CreditCard,
  'user-plus': UserPlus,
  'log-in': LogIn,
  'log-out': LogOut,
};

const typeColors: Record<ActivityItem['type'], { bg: string; text: string; dot: string }> = {
  work_order: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  invoice: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  payment: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    dot: 'bg-green-500',
  },
  customer: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    dot: 'bg-indigo-500',
  },
  technician: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
};

function formatTime(timestamp: string): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function RecentActivity() {
  const { data, isLoading, isError, refetch } = useQuery<{ success: boolean; data: ActivityItem[] }>({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/activity');
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
    retry: 2,
  });

  const activities = data?.data || [];

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Recent Activity
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live feed
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          title="Refresh activity"
        >
          <RefreshCw className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      {/* Activity List */}
      <ScrollArea className="h-[400px]">
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Failed to load activity
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
          ) : activities.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No recent activity
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-700" />

              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const colors = typeColors[activity.type];
                  const Icon = iconMap[activity.icon || 'wrench'] || Wrench;

                  const content = (
                    <div
                      className={cn(
                        'relative flex items-start gap-3 p-3 rounded-lg transition-colors',
                        activity.href && 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer'
                      )}
                    >
                      {/* Timeline dot */}
                      <div className={cn('absolute left-4 w-2 h-2 rounded-full -translate-x-1/2 mt-3', colors.dot)} />

                      {/* Icon */}
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-4', colors.bg)}>
                        <Icon className={cn('w-4 h-4', colors.text)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {activity.title}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {activity.description}
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>

                      {activity.href && (
                        <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      )}
                    </div>
                  );

                  return activity.href ? (
                    <Link key={activity.id} href={activity.href}>
                      {content}
                    </Link>
                  ) : (
                    <div key={activity.id}>{content}</div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
