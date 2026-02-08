'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  AlertCircle,
  DollarSign,
  Clock,
  Send,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';

interface UnpaidInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  vehicle: string | null;
  amount: number;
  balance: number;
  dueDate: string;
  daysOverdue: number;
  status: 'UNPAID' | 'PARTIAL';
  lastPayment: string | null;
}

interface UnpaidInvoicesData {
  invoices: UnpaidInvoice[];
  summary: {
    totalOverdue: number;
    totalUpcoming: number;
    overdueCount: number;
    totalCount: number;
  };
}

function getDaysLabel(days: number): string {
  if (days > 0) {
    return `${days}d overdue`;
  } else if (days === 0) {
    return 'Due today';
  } else {
    return `${Math.abs(days)}d until due`;
  }
}

export function UnpaidInvoicesAlert() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'unpaid-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/unpaid-invoices');
      const json = await res.json();
      return json.data as UnpaidInvoicesData;
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  const invoices = data?.invoices || [];
  const summary = data?.summary || { totalOverdue: 0, totalUpcoming: 0, overdueCount: 0, totalCount: 0 };
  const hasOverdue = summary.overdueCount > 0;

  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden',
        hasOverdue
          ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
          : 'bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-5 py-4 border-b flex items-center justify-between',
          hasOverdue
            ? 'border-red-100 dark:border-red-900'
            : 'border-neutral-100 dark:border-neutral-700'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              hasOverdue
                ? 'bg-gradient-to-br from-red-500 to-rose-600'
                : 'bg-gradient-to-br from-amber-500 to-orange-600'
            )}
          >
            {hasOverdue ? (
              <AlertTriangle className="w-4 h-4 text-white" />
            ) : (
              <DollarSign className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <h3
              className={cn(
                'font-semibold text-sm',
                hasOverdue ? 'text-red-900 dark:text-red-100' : 'text-neutral-900 dark:text-neutral-100'
              )}
            >
              {hasOverdue ? 'Overdue Payments' : 'Unpaid Invoices'}
            </h3>
            <p
              className={cn(
                'text-xs',
                hasOverdue ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              {summary.overdueCount} overdue · {summary.totalCount} total
            </p>
          </div>
        </div>
        <Link
          href="/invoices?status=unpaid"
          className={cn(
            'text-xs font-medium flex items-center gap-1 transition-colors',
            hasOverdue
              ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-100'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          )}
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Summary Cards */}
      {(summary.totalOverdue > 0 || summary.totalUpcoming > 0) && (
        <div className="grid grid-cols-2 gap-px bg-neutral-100 dark:bg-neutral-700">
          <div className="bg-white dark:bg-neutral-800 p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Overdue</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalOverdue)}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-800 p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Upcoming</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(summary.totalUpcoming)}
            </p>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))
        ) : invoices.length === 0 ? (
          <div className="px-5 py-10 text-center bg-white dark:bg-neutral-800">
            <DollarSign className="w-10 h-10 text-green-300 dark:text-green-600 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              All invoices are paid!
            </p>
          </div>
        ) : (
          invoices.slice(0, 5).map((invoice) => {
            const isOverdue = invoice.daysOverdue > 0;
            return (
              <div
                key={invoice.id}
                className="px-5 py-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-[#ee7a14] truncate"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      {invoice.status === 'PARTIAL' && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Partial
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {invoice.customer}
                      {invoice.vehicle && ` · ${invoice.vehicle}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-[10px] font-medium flex items-center gap-1',
                          isOverdue
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-neutral-400 dark:text-neutral-500'
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        {getDaysLabel(invoice.daysOverdue)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-sm font-bold',
                          isOverdue ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'
                        )}
                      >
                        {formatCurrency(invoice.balance)}
                      </p>
                      {invoice.balance !== invoice.amount && (
                        <p className="text-[10px] text-neutral-400 line-through">
                          {formatCurrency(invoice.amount)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Send reminder"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
