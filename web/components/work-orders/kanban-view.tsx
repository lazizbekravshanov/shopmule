'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  User,
  AlertTriangle,
  Flame,
  Package,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import type { PartsStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { WorkOrderWithAI, SlaRisk } from '@/lib/ai/work-order-ai';

// ─── Age alert thresholds (edit these to tune shop-wide) ──────────────────
const AGE_WARN_HOURS  = 24;   // amber
const AGE_ALERT_HOURS = 48;   // orange
const AGE_CRIT_DAYS   = 5;    // red + card highlight

// ─── Helpers ──────────────────────────────────────────────────────────────
function ageHours(createdAt?: string): number {
  if (!createdAt) return 0;
  return (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
}

function formatAge(hours: number): string {
  if (hours < 1) return '<1h';
  if (hours < 24) return `${Math.floor(hours)}h`;
  const days = Math.floor(hours / 24);
  const rem  = Math.floor(hours % 24);
  if (rem === 0) return `${days}d`;
  return `${days}d ${rem}h`;
}

type AgeLevel = 'fresh' | 'warn' | 'alert' | 'crit';

function ageLevel(hours: number): AgeLevel {
  if (hours >= AGE_CRIT_DAYS * 24) return 'crit';
  if (hours >= AGE_ALERT_HOURS)    return 'alert';
  if (hours >= AGE_WARN_HOURS)     return 'warn';
  return 'fresh';
}

const ageLevelStyles: Record<AgeLevel, string> = {
  fresh: 'text-neutral-400 bg-transparent',
  warn:  'text-amber-600  bg-amber-50   border border-amber-200',
  alert: 'text-orange-600 bg-orange-50  border border-orange-200',
  crit:  'text-red-600    bg-red-50     border border-red-200',
};

const ageLevelBorder: Record<AgeLevel, string> = {
  fresh: '',
  warn:  '',
  alert: 'border-l-2 border-l-orange-400',
  crit:  'border-l-2 border-l-red-500',
};

// ─── Sub-components ────────────────────────────────────────────────────────

interface KanbanViewProps {
  workOrders: WorkOrderWithAI[];
}

const COLUMNS = [
  { status: 'DIAGNOSED',   label: 'Diagnosed',   color: 'border-neutral-300', headerBg: 'bg-neutral-50' },
  { status: 'APPROVED',    label: 'Approved',    color: 'border-blue-300',    headerBg: 'bg-blue-50'    },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-orange-300',  headerBg: 'bg-orange-50'  },
  { status: 'COMPLETED',   label: 'Completed',   color: 'border-emerald-300', headerBg: 'bg-emerald-50' },
] as const;

const slaColors: Record<SlaRisk, string> = {
  low:  'bg-emerald-100 text-emerald-700',
  med:  'bg-amber-100   text-amber-700',
  high: 'bg-red-100     text-red-700',
};

function PriorityBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-red-500'     :
    score >= 60 ? 'bg-amber-500'   :
    score >= 40 ? 'bg-blue-500'    :
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

function AgeBadge({ createdAt }: { createdAt?: string }) {
  const hours = ageHours(createdAt);
  const level = ageLevel(hours);

  if (level === 'fresh') {
    return (
      <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
        <Clock className="w-2.5 h-2.5" />
        {formatAge(hours)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5',
        ageLevelStyles[level]
      )}
    >
      {level === 'crit'
        ? <Flame className="w-2.5 h-2.5" />
        : <AlertTriangle className="w-2.5 h-2.5" />
      }
      {formatAge(hours)}
    </span>
  );
}

// ─── Parts status chip ──────────────────────────────────────────────────────

const partsChipConfig: Record<
  NonNullable<PartsStatus>,
  { Icon: React.ElementType; label: string; cls: string }
> = {
  WAITING:  { Icon: Package,       label: 'Waiting on Parts', cls: 'text-amber-700  bg-amber-50  border-amber-300' },
  ORDERED:  { Icon: Truck,         label: 'Parts Ordered',    cls: 'text-blue-700   bg-blue-50   border-blue-300'  },
  IN_STOCK: { Icon: CheckCircle2,  label: 'Parts In',         cls: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
};

function PartsChip({ status }: { status: PartsStatus | null | undefined }) {
  if (!status) return null;
  const { Icon, label, cls } = partsChipConfig[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border', cls)}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

function KanbanCard({ wo }: { wo: WorkOrderWithAI }) {
  const vehicle     = wo.vehicle;
  const customer    = vehicle?.customer;
  const hasBlockers = wo.ai.blockers.length > 0;
  const hours       = ageHours(wo.createdAt);
  const level       = ageLevel(hours);

  return (
    <Link href={`/work-orders/${wo.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'bg-white border rounded-lg p-3 cursor-pointer transition-all',
          'hover:shadow-md hover:border-neutral-300',
          ageLevelBorder[level],
          // crit cards get a very faint red tint so they jump out on the board
          level === 'crit' && 'bg-red-50/30',
        )}
      >
        <PriorityBar score={wo.ai.priorityScore} />

        <div className="mt-2.5">
          {/* Vehicle */}
          <div className="font-medium text-sm text-neutral-900">
            {vehicle
              ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`
              : 'Unknown Vehicle'}
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

        {/* Parts status */}
        {wo.partsStatus && (
          <div className="mt-2">
            <PartsChip status={wo.partsStatus} />
          </div>
        )}

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
                {b === 'parts'    && 'Parts'}
                {b === 'approval' && 'Approval'}
                {b === 'tech'     && 'No Tech'}
                {b === 'customer' && 'Customer'}
              </span>
            ))}
          </div>
        )}

        {/* Footer — WO ID + age badge */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-50">
          <span className="text-[10px] font-mono text-neutral-400">
            {wo.id.slice(0, 8)}
          </span>
          <AgeBadge createdAt={wo.createdAt} />
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Column header with stale-count badge ─────────────────────────────────

function ColumnHeader({
  label,
  total,
  staleCount,
  critCount,
  partsWaitingCount,
  headerBg,
  color,
}: {
  label: string;
  total: number;
  staleCount: number;
  critCount: number;
  partsWaitingCount: number;
  headerBg: string;
  color: string;
}) {
  return (
    <div className={cn('rounded-t-lg border border-b-2 px-3 py-2.5', headerBg, color)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-700">{label}</span>
        <div className="flex items-center gap-1">
          {partsWaitingCount > 0 && (
            <span
              className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
              title={`${partsWaitingCount} waiting on parts`}
            >
              <Package className="w-2.5 h-2.5" />
              {partsWaitingCount}
            </span>
          )}
          {critCount > 0 && (
            <span
              className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
              title={`${critCount} work order${critCount > 1 ? 's' : ''} open >5 days`}
            >
              <Flame className="w-2.5 h-2.5" />
              {critCount}
            </span>
          )}
          {staleCount > 0 && critCount === 0 && (
            <span
              className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
              title={`${staleCount} work order${staleCount > 1 ? 's' : ''} open >48h`}
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              {staleCount}
            </span>
          )}
          <span className="text-xs font-bold text-neutral-500 bg-white/80 px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main board ────────────────────────────────────────────────────────────

export function KanbanView({ workOrders }: KanbanViewProps) {
  return (
    <div className="grid grid-cols-4 gap-4 min-h-[500px]">
      {COLUMNS.map((col) => {
        const items = workOrders
          .filter((wo) => wo.status === col.status)
          .sort((a, b) => {
            // Sort: crits first, then by priority score
            const aHours = ageHours(a.createdAt);
            const bHours = ageHours(b.createdAt);
            const aCrit  = aHours >= AGE_CRIT_DAYS * 24 ? 1 : 0;
            const bCrit  = bHours >= AGE_CRIT_DAYS * 24 ? 1 : 0;
            if (bCrit !== aCrit) return bCrit - aCrit;
            return b.ai.priorityScore - a.ai.priorityScore;
          });

        const staleCount = items.filter((wo) => {
          const h = ageHours(wo.createdAt);
          return h >= AGE_ALERT_HOURS && h < AGE_CRIT_DAYS * 24;
        }).length;

        const critCount = items.filter(
          (wo) => ageHours(wo.createdAt) >= AGE_CRIT_DAYS * 24
        ).length;

        const partsWaitingCount = items.filter(
          (wo) => wo.partsStatus === 'WAITING' || wo.partsStatus === 'ORDERED'
        ).length;

        return (
          <div key={col.status} className="flex flex-col">
            <ColumnHeader
              label={col.label}
              total={items.length}
              staleCount={staleCount}
              critCount={critCount}
              partsWaitingCount={partsWaitingCount}
              headerBg={col.headerBg}
              color={col.color}
            />

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
