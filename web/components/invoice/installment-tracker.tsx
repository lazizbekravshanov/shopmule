'use client';

import { CheckCircle2, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstallmentPayment {
  id: string;
  sequenceNumber: number;
  amount: number;
  dueDate: string;
  status: string;
  paidAt: string | null;
}

interface InstallmentPlan {
  id: string;
  totalAmount: number;
  numberOfPayments: number;
  frequency: string;
  status: string;
  payments: InstallmentPayment[];
}

interface InstallmentTrackerProps {
  plan: InstallmentPlan;
  onPayNext?: () => void;
  isPayingNext?: boolean;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  PAID: { icon: CheckCircle2, color: 'text-emerald-600', label: 'Paid' },
  DUE: { icon: CreditCard, color: 'text-[#ee7a14]', label: 'Due Now' },
  PROCESSING: { icon: Clock, color: 'text-blue-500', label: 'Processing' },
  UPCOMING: { icon: Clock, color: 'text-neutral-400', label: 'Upcoming' },
  OVERDUE: { icon: AlertCircle, color: 'text-red-600', label: 'Overdue' },
  FAILED: { icon: AlertCircle, color: 'text-red-600', label: 'Failed' },
};

export function InstallmentTracker({ plan, onPayNext, isPayingNext }: InstallmentTrackerProps) {
  const paidCount = plan.payments.filter((p) => p.status === 'PAID').length;
  const nextDue = plan.payments.find(
    (p) => p.status === 'DUE' || p.status === 'UPCOMING' || p.status === 'OVERDUE'
  );

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Pay in {plan.numberOfPayments}
        </span>
        <span className="text-xs text-neutral-500">
          {paidCount}/{plan.numberOfPayments} paid
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${(paidCount / plan.numberOfPayments) * 100}%` }}
        />
      </div>

      {/* Payment timeline */}
      <div className="space-y-0">
        {plan.payments.map((payment, i) => {
          const config = STATUS_CONFIG[payment.status] || STATUS_CONFIG.UPCOMING;
          const Icon = config.icon;
          const isLast = i === plan.payments.length - 1;
          const dueDate = new Date(payment.dueDate);

          return (
            <div key={payment.id} className="flex gap-3">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={cn('h-6 w-6 rounded-full border-2 flex items-center justify-center', config.color, 'border-current')}>
                  <Icon className="h-3 w-3" />
                </div>
                {!isLast && <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-700 my-1" />}
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      ${payment.amount.toFixed(2)}
                    </span>
                    <span className={cn('ml-2 text-xs font-medium', config.color)}>
                      {config.label}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {payment.paidAt
                      ? `Paid ${new Date(payment.paidAt).toLocaleDateString()}`
                      : `Due ${dueDate.toLocaleDateString()}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay next button */}
      {nextDue && onPayNext && (
        <button
          onClick={onPayNext}
          disabled={isPayingNext}
          className="w-full py-2.5 px-4 bg-[#ee7a14] hover:bg-[#d96a0a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isPayingNext ? 'Processing...' : `Pay $${nextDue.amount.toFixed(2)} — Installment ${nextDue.sequenceNumber}`}
        </button>
      )}
    </div>
  );
}
