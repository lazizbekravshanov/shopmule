'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Zap,
  FileText,
  Phone,
  Package,
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
  DollarSign,
  Wrench,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SmartAction {
  id: string;
  type: string;
  label: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  href: string;
  badge?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  estimates: FileText,
  inventory: Package,
  invoice: DollarSign,
  collections: AlertTriangle,
  'work-orders': Wrench,
  callbacks: Phone,
  attendance: Users,
  default: Clock,
};

const urgencyConfig = {
  high: {
    bg: 'bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-500',
  },
  medium: {
    bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-500',
  },
  low: {
    bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-500',
  },
};

export function SmartActions() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', 'smart-actions'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/smart-actions');
      const json = await res.json();
      return json.data as SmartAction[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const actions = data || [];

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Smart Actions
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Context-aware tasks
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn('w-4 h-4 text-neutral-500', isFetching && 'animate-spin')}
          />
        </button>
      </div>

      {/* Actions List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : actions.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              All caught up!
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              No urgent actions needed right now
            </p>
          </div>
        ) : (
          actions.map((action) => {
            const config = urgencyConfig[action.urgency];
            const Icon = iconMap[action.type] || iconMap.default;

            return (
              <Link
                key={action.id}
                href={action.href}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 transition-colors group',
                  config.bg
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border',
                    config.border,
                    config.bg
                  )}
                >
                  <Icon className={cn('w-4 h-4', config.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {action.label}
                    </span>
                    {action.badge && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full',
                          config.badge
                        )}
                      >
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {action.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })
        )}
      </div>

      {/* AI Suggestion Footer */}
      <div className="px-5 py-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-t border-violet-100 dark:border-violet-900">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-violet-700 dark:text-violet-400">
            AI prioritized based on urgency & revenue impact
          </span>
        </div>
      </div>
    </div>
  );
}
