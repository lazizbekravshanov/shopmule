'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Briefcase,
  BarChart3,
  Users,
  Package,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MetricProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
  icon?: React.ElementType;
  iconColor?: string;
  alert?: boolean;
  tooltip?: string;
}

function Metric({
  label,
  value,
  trend,
  trendValue,
  delay = 0,
  icon: Icon,
  iconColor = 'text-neutral-400',
  alert = false,
  tooltip,
}: MetricProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'text-center p-4 rounded-xl transition-colors',
        alert ? 'bg-red-50 dark:bg-red-950/30 ring-1 ring-red-200 dark:ring-red-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/30'
      )}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        {Icon && (
          <Icon
            className={cn('w-4 h-4', alert ? 'text-red-500' : iconColor)}
          />
        )}
        <p className={cn(
          'text-sm font-medium',
          alert ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'
        )}>
          {label}
        </p>
      </div>
      <p
        className={cn(
          'text-2xl md:text-3xl font-semibold tracking-tight',
          alert ? 'text-red-700 dark:text-red-300' : 'text-neutral-900 dark:text-white'
        )}
      >
        {value}
      </p>
      {trend && trendValue && (
        <div
          className={cn(
            'flex items-center justify-center gap-1 mt-1 text-xs font-medium',
            trend === 'up' && 'text-green-600 dark:text-green-400',
            trend === 'down' && 'text-red-600 dark:text-red-400',
            trend === 'neutral' && 'text-neutral-500'
          )}
        >
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend === 'neutral' && <Minus className="w-3 h-3" />}
          <span>{trendValue}</span>
        </div>
      )}
    </motion.div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

interface DashboardMetrics {
  revenue: { mtd: number; change: number; lastMonth: number };
  jobs: { active: number; total: number };
  margin: { percentage: number; trend: 'up' | 'down' | 'neutral' };
  customers: { active: number };
  inventory: { partsOnOrder: number; lowStock: { id: string; name: string; stock: number }[] };
  invoices: { overdueCount: number; overdueTotal: number };
  technicians: { active: number; total: number; utilization: number };
}

export function ShopPulse() {
  const { data, isLoading, isError, refetch } = useQuery<{ success: boolean; data: DashboardMetrics }>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 30000,
    retry: 2,
  });

  const metrics = data?.data;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">Shop Pulse</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Real-time shop metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4 text-neutral-400" />
          </button>
          <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="text-center p-4">
              <Skeleton className="h-4 w-16 mx-auto mb-2" />
              <Skeleton className="h-8 w-20 mx-auto" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Failed to load metrics
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-[#ee7a14] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <Metric
            label="Revenue (MTD)"
            value={formatCurrency(metrics?.revenue.mtd ?? 0)}
            trend={metrics?.revenue.change && metrics.revenue.change > 0 ? 'up' : metrics?.revenue.change && metrics.revenue.change < 0 ? 'down' : 'neutral'}
            trendValue={metrics?.revenue.change ? `${metrics.revenue.change > 0 ? '+' : ''}${metrics.revenue.change}% vs last month` : '—'}
            icon={DollarSign}
            iconColor="text-green-500"
            delay={0}
            tooltip={`Last month: ${formatCurrency(metrics?.revenue.lastMonth ?? 0)}`}
          />
          <Metric
            label="Active Jobs"
            value={String(metrics?.jobs.active ?? 0)}
            trend="neutral"
            trendValue={`${metrics?.jobs.total ?? 0} this month`}
            icon={Briefcase}
            iconColor="text-blue-500"
            delay={0.05}
          />
          <Metric
            label="Margin"
            value={`${metrics?.margin.percentage ?? 0}%`}
            trend={metrics?.margin.trend}
            trendValue={metrics?.margin.trend === 'up' ? 'Healthy' : metrics?.margin.trend === 'down' ? 'Needs attention' : 'Stable'}
            icon={BarChart3}
            iconColor="text-purple-500"
            delay={0.1}
          />
          <Metric
            label="Customers"
            value={String(metrics?.customers.active ?? 0)}
            trend="up"
            trendValue="Active this month"
            icon={Users}
            iconColor="text-indigo-500"
            delay={0.15}
          />
          <Metric
            label="Parts Low"
            value={String(metrics?.inventory.partsOnOrder ?? 0)}
            trend={metrics?.inventory.partsOnOrder && metrics.inventory.partsOnOrder > 5 ? 'down' : 'neutral'}
            trendValue={metrics?.inventory.partsOnOrder && metrics.inventory.partsOnOrder > 0 ? 'Need reorder' : 'Stock OK'}
            icon={Package}
            iconColor="text-amber-500"
            delay={0.2}
            alert={!!metrics?.inventory.partsOnOrder && metrics.inventory.partsOnOrder > 5}
            tooltip={metrics?.inventory.lowStock?.map(p => p.name).join(', ')}
          />
          <Metric
            label="Overdue"
            value={`$${((metrics?.invoices.overdueTotal ?? 0) / 1000).toFixed(1)}k`}
            trend={metrics?.invoices.overdueCount && metrics.invoices.overdueCount > 0 ? 'down' : 'up'}
            trendValue={`${metrics?.invoices.overdueCount ?? 0} invoices`}
            icon={AlertTriangle}
            iconColor="text-red-500"
            delay={0.25}
            alert={!!metrics?.invoices.overdueCount && metrics.invoices.overdueCount > 0}
          />
          <Metric
            label="Tech Utilization"
            value={`${metrics?.technicians.utilization ?? 0}%`}
            trend={
              metrics?.technicians.utilization && metrics.technicians.utilization >= 75
                ? 'up'
                : metrics?.technicians.utilization && metrics.technicians.utilization < 50
                  ? 'down'
                  : 'neutral'
            }
            trendValue={`${metrics?.technicians.active ?? 0}/${metrics?.technicians.total ?? 0} active`}
            icon={Clock}
            iconColor="text-teal-500"
            delay={0.3}
          />
        </div>
      )}
    </div>
  );
}
