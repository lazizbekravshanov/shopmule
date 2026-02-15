'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  DollarSign,
  Package,
  ShieldAlert,
  User,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { WorkOrderWithAI, SlaRisk } from '@/lib/ai/work-order-ai';

interface KanbanViewProps {
  workOrders: WorkOrderWithAI[];
}

const COLUMNS = [
  { status: 'DIAGNOSED', label: 'Diagnosed', color: 'border-neutral-300', headerBg: 'bg-neutral-50' },
  { status: 'APPROVED', label: 'Approved', color: 'border-blue-300', headerBg: 'bg-blue-50' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-orange-300', headerBg: 'bg-orange-50' },
  { status: 'COMPLETED', label: 'Completed', color: 'border-emerald-300', headerBg: 'bg-emerald-50' },
] as const;

const slaColors: Record<SlaRisk, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  med: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

function PriorityBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-red-500' :
    score >= 60 ? 'bg-amber-500' :
    score >= 40 ? 'bg-blue-500' :
    'bg-emerald-500';

  return (
    <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', color)}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function KanbanCard({ wo }: { wo: WorkOrderWithAI }) {
  const vehicle = wo.vehicle;
  const customer = vehicle?.customer;
  const hasBlockers = wo.ai.blockers.length > 0;

  return (
    <Link href={`/work-orders/${wo.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'bg-white border rounded-lg p-3 cursor-pointer transition-all',
          'hover:shadow-md hover:border-neutral-300',
          wo.ai.slaRisk === 'high' && 'border-l-2 border-l-red-500',
        )}
      >
        <PriorityBar score={wo.ai.priorityScore} />

        <div className="mt-2.5">
          {/* Vehicle */}
          <div className="font-medium text-sm text-neutral-900">
            {vehicle ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
          </div>

          {/* Customer */}
          {customer && (
            <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
              <User className="w-3 h-3" />
              {customer.name}
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">{wo.description}</p>
        </div>

        {/* AI Signals Row */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', slaColors[wo.ai.slaRisk])}>
            {wo.ai.slaRisk.toUpperCase()}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full">
            {formatCurrency(wo.ai.revenueEstimate)}
          </span>
          <span className="text-[10px] text-neutral-500 bg-neutral-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {wo.ai.predictedEta}
          </span>
        </div>

        {/* Blockers */}
        {hasBlockers && (
          <div className="flex items-center gap-1 mt-2">
            {wo.ai.blockers.map((b) => (
              <span
                key={b}
                className="text-[9px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded"
              >
                {b === 'parts' && 'Parts'}
                {b === 'approval' && 'Approval'}
                {b === 'tech' && 'No Tech'}
                {b === 'customer' && 'Customer'}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-50">
          <span className="text-[10px] font-mono text-neutral-400">
            {wo.id.slice(0, 8)}
          </span>
          <span className="text-[10px] text-neutral-400">
            Score {wo.ai.priorityScore}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export function KanbanView({ workOrders }: KanbanViewProps) {
  return (
    <div className="grid grid-cols-4 gap-4 min-h-[500px]">
      {COLUMNS.map((col) => {
        const items = workOrders
          .filter((wo) => wo.status === col.status)
          .sort((a, b) => b.ai.priorityScore - a.ai.priorityScore);

        return (
          <div key={col.status} className="flex flex-col">
            {/* Column Header */}
            <div className={cn('rounded-t-lg border border-b-2 px-3 py-2.5', col.headerBg, col.color)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">{col.label}</span>
                <span className="text-xs font-bold text-neutral-500 bg-white/80 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 p-2 bg-neutral-50/50 rounded-b-lg border border-t-0 border-neutral-200 overflow-y-auto max-h-[600px]">
              {items.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-400">
                  No work orders
                </div>
              ) : (
                items.map((wo) => <KanbanCard key={wo.id} wo={wo} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
