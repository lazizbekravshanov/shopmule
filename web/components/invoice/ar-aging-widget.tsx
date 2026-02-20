'use client';

import { AlertTriangle, Clock, Flame, TrendingUp, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useInvoiceAging, useSendReminder } from '@/lib/queries/invoices';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { InvoiceAgingBucket } from '@/lib/api';

// ─── Bucket config ──────────────────────────────────────────────────────────

interface BucketConfig {
  key: 'current' | 'overdue31' | 'overdue61' | 'overdue90';
  label: string;
  sublabel: string;
  icon: React.ElementType;
  colors: {
    border: string;
    bg: string;
    iconBg: string;
    icon: string;
    label: string;
    amount: string;
    count: string;
    activeBorder: string;
    activeBg: string;
  };
}

const BUCKETS: BucketConfig[] = [
  {
    key: 'current',
    label: 'Current',
    sublabel: '0 – 30 days',
    icon: TrendingUp,
    colors: {
      border: 'border-neutral-200',
      bg: 'bg-white',
      iconBg: 'bg-emerald-50',
      icon: 'text-emerald-500',
      label: 'text-neutral-700',
      amount: 'text-neutral-900',
      count: 'text-neutral-400',
      activeBorder: 'border-emerald-400',
      activeBg: 'bg-emerald-50/60',
    },
  },
  {
    key: 'overdue31',
    label: 'Overdue',
    sublabel: '31 – 60 days',
    icon: Clock,
    colors: {
      border: 'border-amber-200',
      bg: 'bg-amber-50/40',
      iconBg: 'bg-amber-100',
      icon: 'text-amber-600',
      label: 'text-amber-800',
      amount: 'text-amber-900',
      count: 'text-amber-500',
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-50',
    },
  },
  {
    key: 'overdue61',
    label: 'Overdue',
    sublabel: '61 – 90 days',
    icon: AlertTriangle,
    colors: {
      border: 'border-orange-300',
      bg: 'bg-orange-50/40',
      iconBg: 'bg-orange-100',
      icon: 'text-orange-600',
      label: 'text-orange-800',
      amount: 'text-orange-900',
      count: 'text-orange-500',
      activeBorder: 'border-orange-500',
      activeBg: 'bg-orange-50',
    },
  },
  {
    key: 'overdue90',
    label: 'Critical',
    sublabel: '90+ days',
    icon: Flame,
    colors: {
      border: 'border-red-300',
      bg: 'bg-red-50/40',
      iconBg: 'bg-red-100',
      icon: 'text-red-600',
      label: 'text-red-800',
      amount: 'text-red-900',
      count: 'text-red-500',
      activeBorder: 'border-red-500',
      activeBg: 'bg-red-50',
    },
  },
];

// ─── Single bucket card ──────────────────────────────────────────────────────

function BucketCard({
  config,
  bucket,
  active,
  onClick,
  onRemindAll,
  reminding,
}: {
  config: BucketConfig;
  bucket: InvoiceAgingBucket;
  active: boolean;
  onClick: () => void;
  onRemindAll: () => void;
  reminding: boolean;
}) {
  const Icon = config.icon;
  const c = config.colors;
  const isOverdue = config.key !== 'current';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'relative flex flex-col gap-2 rounded-lg border p-4 cursor-pointer transition-all select-none',
        'focus:outline-none focus:ring-2 focus:ring-[#ee7a14] focus:ring-offset-1',
        active ? `${c.activeBorder} ${c.activeBg} ring-1 ${c.activeBorder}` : `${c.border} ${c.bg} hover:border-opacity-70`,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn('rounded-md p-1.5', c.iconBg)}>
          <Icon className={cn('h-4 w-4', c.icon)} />
        </div>
        {isOverdue && bucket.count > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className={cn('h-6 text-[10px] px-2 gap-1 shrink-0', c.count)}
            onClick={(e) => { e.stopPropagation(); onRemindAll(); }}
            disabled={reminding}
            title="Send payment reminder to all customers in this bucket"
          >
            {reminding ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Send className="h-2.5 w-2.5" />}
            Remind
          </Button>
        )}
      </div>

      <div>
        <div className={cn('text-xs font-medium', c.label)}>{config.label}</div>
        <div className="text-[10px] text-neutral-400">{config.sublabel}</div>
      </div>

      <div>
        <div className={cn('text-xl font-bold tabular-nums', c.amount)}>
          {formatCurrency(bucket.total)}
        </div>
        <div className={cn('text-[10px] mt-0.5', c.count)}>
          {bucket.count} invoice{bucket.count !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

// ─── Main widget ─────────────────────────────────────────────────────────────

interface ARAgingWidgetProps {
  activeBucket: string | null;
  onBucketClick: (key: string | null) => void;
}

export function ARAgingWidget({ activeBucket, onBucketClick }: ARAgingWidgetProps) {
  const { data, isLoading } = useInvoiceAging();
  const sendReminder = useSendReminder();
  const { toast } = useToast();

  const handleRemindAll = async (config: BucketConfig, bucket: InvoiceAgingBucket) => {
    if (bucket.count === 0) return;
    const results = await Promise.allSettled(
      bucket.invoiceIds.map((id) =>
        sendReminder.mutateAsync({ invoiceId: id, channels: ['email', 'sms'] })
      )
    );
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - succeeded;
    if (failed === 0) {
      toast({ title: `Reminders sent`, description: `${succeeded} customer${succeeded !== 1 ? 's' : ''} notified for ${config.label} invoices` });
    } else {
      toast({ variant: 'destructive', title: 'Partial failure', description: `${succeeded} sent, ${failed} failed` });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {BUCKETS.map((b) => (
          <div key={b.key} className="h-[120px] rounded-lg border border-neutral-100 bg-neutral-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const totalOutstanding = data.totalOutstanding;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">AR Aging</span>
          {totalOutstanding > 0 && (
            <span className="text-xs text-neutral-400">
              {formatCurrency(totalOutstanding)} outstanding
            </span>
          )}
        </div>
        {activeBucket && (
          <button
            onClick={() => onBucketClick(null)}
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {BUCKETS.map((config) => {
          const bucket = data.buckets[config.key];
          return (
            <BucketCard
              key={config.key}
              config={config}
              bucket={bucket}
              active={activeBucket === config.key}
              onClick={() => onBucketClick(activeBucket === config.key ? null : config.key)}
              onRemindAll={() => handleRemindAll(config, bucket)}
              reminding={sendReminder.isPending}
            />
          );
        })}
      </div>
    </div>
  );
}
