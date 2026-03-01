'use client';

import { Clock, DollarSign, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { WorkflowCard, type WorkflowWorkOrder, type ColumnType } from './workflow-card';

interface ColumnDef {
  key: ColumnType;
  title: string;
  dotColor: string;
  statuses: string[];
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'estimate',
    title: 'Estimate',
    dotColor: 'bg-orange-400',
    statuses: ['ESTIMATE', 'ESTIMATE_SENT', 'AWAITING_APPROVAL'],
  },
  {
    key: 'in_progress',
    title: 'In Progress',
    dotColor: 'bg-blue-500',
    statuses: ['APPROVED', 'IN_PROGRESS', 'WAITING_ON_PARTS'],
  },
  {
    key: 'quality_check',
    title: 'Quality Check',
    dotColor: 'bg-emerald-500',
    statuses: ['QUALITY_CHECK', 'READY_FOR_PICKUP'],
  },
  {
    key: 'invoiced',
    title: 'Invoiced',
    dotColor: 'bg-emerald-700',
    statuses: ['INVOICED'],
  },
];

interface WorkflowBoardProps {
  workOrders: WorkflowWorkOrder[];
}

export function WorkflowBoard({ workOrders }: WorkflowBoardProps) {
  return (
    <div className="grid grid-cols-4 gap-4 min-h-[500px]">
      {COLUMNS.map((col) => {
        const items = workOrders.filter((wo) =>
          col.statuses.includes(wo.status)
        );

        const totalHours = items.reduce(
          (sum, wo) => sum + wo.laborEntries.reduce((s, l) => s + l.hours, 0),
          0
        );
        const totalValue = items.reduce((sum, wo) => sum + wo.grandTotal, 0);

        return (
          <div key={col.key} className="flex flex-col">
            {/* Column Header */}
            <div className="bg-white border rounded-t-lg px-3 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', col.dotColor)} />
                  <span className="text-sm font-semibold text-neutral-700">
                    {col.title}
                  </span>
                  <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <button className="p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Aggregate stats */}
              {items.length > 0 && (
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {totalHours.toFixed(1)}h
                  </span>
                  <span className="flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 p-2 bg-neutral-50/50 rounded-b-lg border border-t-0 border-neutral-200 overflow-y-auto max-h-[calc(100vh-220px)]">
              {items.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-400">
                  No work orders
                </div>
              ) : (
                items.map((wo) => (
                  <WorkflowCard key={wo.id} wo={wo} column={col.key} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
