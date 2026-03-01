'use client';

import Link from 'next/link';
import {
  Clock,
  Car,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

export interface WorkflowWorkOrder {
  id: string;
  workOrderNumber: string;
  status: string;
  priority: string;
  description: string;
  customerComplaint?: string | null;
  laborTotal: number;
  partsTotal: number;
  grandTotal: number;
  promisedDate?: string | null;
  createdAt: string;
  vehicle: {
    year?: number | null;
    make: string;
    model: string;
  };
  customer: {
    displayName: string;
  };
  laborEntries: Array<{
    hours: number;
  }>;
  parts: Array<{
    quantity: number;
    partId: string;
  }>;
  partsRequired: number; // total distinct parts expected (from line items or parts)
}

// Which visual column this card lives in
export type ColumnType = 'estimate' | 'in_progress' | 'quality_check' | 'invoiced';

const priorityConfig: Record<string, { label: string; cls: string }> = {
  URGENT: { label: 'Urgent', cls: 'bg-red-100 text-red-700 border-red-200' },
  HIGH: { label: 'High', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  NORMAL: { label: 'Medium', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  LOW: { label: 'Low', cls: 'bg-green-100 text-green-700 border-green-200' },
};

const columnProgressColor: Record<ColumnType, string> = {
  estimate: 'bg-orange-400',
  in_progress: 'bg-blue-500',
  quality_check: 'bg-emerald-500',
  invoiced: 'bg-emerald-600',
};

function progressPercent(status: string): number {
  const map: Record<string, number> = {
    ESTIMATE: 10,
    ESTIMATE_SENT: 20,
    AWAITING_APPROVAL: 30,
    APPROVED: 40,
    IN_PROGRESS: 55,
    WAITING_ON_PARTS: 50,
    QUALITY_CHECK: 80,
    READY_FOR_PICKUP: 90,
    INVOICED: 100,
  };
  return map[status] ?? 0;
}

function isAuthorized(status: string): boolean {
  return ['APPROVED', 'IN_PROGRESS', 'WAITING_ON_PARTS', 'QUALITY_CHECK', 'READY_FOR_PICKUP', 'INVOICED'].includes(status);
}

function isOverdue(promisedDate?: string | null): boolean {
  if (!promisedDate) return false;
  return new Date(promisedDate) < new Date();
}

interface WorkflowCardProps {
  wo: WorkflowWorkOrder;
  column: ColumnType;
}

export function WorkflowCard({ wo, column }: WorkflowCardProps) {
  const priority = priorityConfig[wo.priority] ?? priorityConfig.NORMAL;
  const totalHours = wo.laborEntries.reduce((sum, l) => sum + l.hours, 0);
  const partsUsed = wo.parts.length;
  const progress = progressPercent(wo.status);
  const overdue = isOverdue(wo.promisedDate);
  const authorized = isAuthorized(wo.status);
  const isPaid = wo.status === 'INVOICED';

  return (
    <Link href={`/work-orders/${wo.id}`}>
      <div
        className={cn(
          'bg-white border rounded-lg p-3.5 cursor-pointer transition-all',
          'hover:shadow-md hover:border-neutral-300',
          overdue && wo.priority === 'URGENT' && 'border-l-2 border-l-red-500',
        )}
      >
        {/* Header: WO number + priority badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono font-medium text-neutral-500">
            {wo.workOrderNumber}
          </span>
          <div className="flex items-center gap-1.5">
            {authorized && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Authorized
              </span>
            )}
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded border',
              priority.cls,
            )}>
              {priority.label}
            </span>
          </div>
        </div>

        {/* Parts status badge */}
        {wo.partsRequired > 0 && (
          <div className="mt-1.5">
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border',
              partsUsed >= wo.partsRequired
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-700 bg-amber-50 border-amber-200',
            )}>
              <Wrench className="w-2.5 h-2.5" />
              {partsUsed}/{wo.partsRequired}
            </span>
          </div>
        )}

        {/* Customer name */}
        <div className="mt-2 text-sm font-medium text-neutral-900 truncate">
          {wo.customer.displayName}
        </div>

        {/* Vehicle */}
        <div className="flex items-center gap-1 mt-0.5 text-xs text-neutral-500">
          <Car className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {wo.vehicle.year || ''} {wo.vehicle.make} {wo.vehicle.model}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">
          {wo.customerComplaint || wo.description}
        </p>

        {/* Progress bar */}
        <div className="mt-3 w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', columnProgressColor[column])}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Footer: hours, cost, due/paid */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-50 text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {totalHours.toFixed(1)}h
            </span>
            <span className="flex items-center gap-0.5">
              <DollarSign className="w-3 h-3" />
              {formatCurrency(wo.grandTotal)}
            </span>
          </div>
          <div>
            {isPaid ? (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Paid
              </span>
            ) : wo.promisedDate ? (
              <span className={cn(
                'text-[10px] font-medium flex items-center gap-0.5',
                overdue ? 'text-red-600' : 'text-neutral-400',
              )}>
                {overdue && <AlertTriangle className="w-2.5 h-2.5" />}
                Due: {new Date(wo.promisedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
