'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRevenueReport } from '@/lib/queries/reports';
import { useWorkOrdersSummary } from '@/lib/queries/work-orders';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

function Metric({ label, value, trend, trendValue, delay = 0 }: MetricProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="text-center"
    >
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">
        {value}
      </p>
      {trend && trendValue && (
        <div className={cn(
          'flex items-center justify-center gap-1 mt-1 text-xs font-medium',
          trend === 'up' && 'text-green-600 dark:text-green-400',
          trend === 'down' && 'text-red-600 dark:text-red-400',
          trend === 'neutral' && 'text-neutral-500'
        )}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend === 'neutral' && <Minus className="w-3 h-3" />}
          <span>{trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}

export function ShopPulse() {
  const { data: revenue, isLoading: revenueLoading } = useRevenueReport();
  const { data: workOrderSummary, isLoading: workOrdersLoading } = useWorkOrdersSummary(5);

  const isLoading = revenueLoading || workOrdersLoading;

  // Calculate margin (mock for now - would come from real data)
  const margin = 42; // percentage

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">Shop Pulse</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Today&apos;s snapshot</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
          Live
        </div>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-4 w-16 mx-auto mb-2" />
              <Skeleton className="h-8 w-20 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Metric
            label="Revenue (MTD)"
            value={formatCurrency(revenue?.total ?? 0)}
            trend="up"
            trendValue="+12% vs last month"
            delay={0}
          />
          <Metric
            label="Active Jobs"
            value={String(workOrderSummary?.open ?? 0)}
            trend="neutral"
            trendValue={`${workOrderSummary?.total ?? 0} total`}
            delay={0.1}
          />
          <Metric
            label="Margin"
            value={`${margin}%`}
            trend="up"
            trendValue="+3% improvement"
            delay={0.2}
          />
          <Metric
            label="Customers"
            value={String(workOrderSummary?.activeCustomers ?? 0)}
            trend="up"
            trendValue="Active this month"
            delay={0.3}
          />
        </div>
      )}
    </div>
  );
}
