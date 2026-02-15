'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { WorkOrderWithAI, SlaRisk } from '@/lib/ai/work-order-ai';

interface TimelineViewProps {
  workOrders: WorkOrderWithAI[];
}

const statusIcons: Record<string, React.ElementType> = {
  DIAGNOSED: Circle,
  APPROVED: Clock,
  IN_PROGRESS: Wrench,
  COMPLETED: CheckCircle2,
};

const statusDotColors: Record<string, string> = {
  DIAGNOSED: 'bg-neutral-400',
  APPROVED: 'bg-blue-500',
  IN_PROGRESS: 'bg-orange-500',
  COMPLETED: 'bg-emerald-500',
};

const slaLineColors: Record<SlaRisk, string> = {
  low: 'border-emerald-200',
  med: 'border-amber-300',
  high: 'border-red-400',
};

const slaTextColors: Record<SlaRisk, string> = {
  low: 'text-emerald-600',
  med: 'text-amber-600',
  high: 'text-red-600',
};

export function TimelineView({ workOrders }: TimelineViewProps) {
  // Sort by created date (newest first)
  const sorted = [...workOrders].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  // Group by date
  const grouped: Record<string, WorkOrderWithAI[]> = {};
  sorted.forEach((wo) => {
    const key = wo.createdAt
      ? formatDate(wo.createdAt)
      : 'Unknown Date';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(wo);
  });

  const groupEntries = Object.entries(grouped);

  if (sorted.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
        <Clock className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-neutral-900">No work orders</h3>
        <p className="text-neutral-500 mt-1">Create a work order to see the timeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {groupEntries.map(([date, orders], groupIndex) => (
        <div key={date}>
          {/* Date Header */}
          <div className="sticky top-0 bg-neutral-50/95 backdrop-blur-sm z-10 py-2 px-1">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {date}
            </span>
          </div>

          {/* Work Orders */}
          <div className="relative ml-4">
            {/* Vertical Line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-neutral-200" />

            {orders.map((wo, i) => {
              const Icon = statusIcons[wo.status] || Circle;
              const dotColor = statusDotColors[wo.status] || 'bg-neutral-400';
              const vehicle = wo.vehicle;
              const isHighRisk = wo.ai.slaRisk === 'high';

              return (
                <motion.div
                  key={wo.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-10 pb-4"
                >
                  {/* Dot */}
                  <div className={cn(
                    'absolute left-1 top-2 w-5 h-5 rounded-full flex items-center justify-center z-[1]',
                    dotColor,
                  )}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>

                  {/* Card */}
                  <Link href={`/work-orders/${wo.id}`}>
                    <div className={cn(
                      'bg-white border rounded-lg p-4 transition-all hover:shadow-md hover:border-neutral-300 group',
                      isHighRisk ? 'border-l-2 border-l-red-400' : 'border-neutral-200',
                    )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-neutral-900">
                              {vehicle
                                ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`
                                : 'Unknown Vehicle'}
                            </span>
                            <span className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                              wo.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : wo.status === 'IN_PROGRESS'
                                ? 'bg-orange-100 text-orange-700'
                                : wo.status === 'APPROVED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-neutral-100 text-neutral-600',
                            )}>
                              {wo.status.replace('_', ' ')}
                            </span>
                            {isHighRisk && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                SLA Risk
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                            {wo.description}
                          </p>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-bold text-emerald-600">
                              {formatCurrency(wo.ai.revenueEstimate)}
                            </div>
                            <div className="text-[10px] text-neutral-400">revenue</div>
                          </div>
                          <div className="text-right">
                            <div className={cn('text-sm font-bold', slaTextColors[wo.ai.slaRisk])}>
                              {wo.ai.predictedEta}
                            </div>
                            <div className="text-[10px] text-neutral-400">ETA</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>

                      {/* Blockers */}
                      {wo.ai.blockers.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {wo.ai.blockers.map((b) => (
                            <span
                              key={b}
                              className="text-[9px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
