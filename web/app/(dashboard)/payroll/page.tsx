'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Clock,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Minus as MinusIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePayrollSummary } from '@/lib/queries/payroll';
import { formatCurrency } from '@/lib/utils';
import type { PayrollEmployeeRow } from '@/lib/api';

type Period = 'week' | 'month' | 'quarter' | 'year';

const PERIODS: { label: string; value: Period }[] = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

type SortKey = 'name' | 'regularHours' | 'overtimeHours' | 'grossPay' | 'totalDeductions' | 'netPay';

function downloadCsv(filename: string, rows: string[][]): void {
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function KpiSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export default function PayrollPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [sortKey, setSortKey] = useState<SortKey>('grossPay');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = usePayrollSummary(period);
  const totals = data?.totals;
  const employees = data?.employees ?? [];

  const sorted = useMemo(() => {
    return [...employees].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = (a[sortKey] as number) - (b[sortKey] as number);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [employees, sortKey, sortDir]);

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
        return key;
      }
      setSortDir('desc');
      return key;
    });
  }, []);

  const handleExport = useCallback(() => {
    if (!data) return;
    const rows: string[][] = [
      ['Name', 'Role', 'Pay Type', 'Regular Hrs', 'OT Hrs', 'Gross Pay', 'Deductions', 'Loan Repayments', 'Net Pay'],
      ...sorted.map((e) => [
        e.name,
        formatRole(e.role),
        e.payType,
        String(e.regularHours),
        String(e.overtimeHours),
        String(e.grossPay),
        String(e.totalDeductions),
        String(e.loanRepayments),
        String(e.netPay),
      ]),
    ];
    downloadCsv(`payroll-${period}.csv`, rows);
  }, [data, sorted, period]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'desc'
      ? <ArrowDown className="h-3 w-3 ml-1" />
      : <ArrowUp className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Payroll
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Salary calculations &amp; pay breakdown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-neutral-200 dark:border-neutral-700"
            onClick={handleExport}
            disabled={!data}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              period === p.value
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Total Gross Pay</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(totals?.grossPay ?? 0)}
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                {totals?.employeeCount ?? 0} employees
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-3">
                <MinusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Total Deductions</span>
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency((totals?.totalDeductions ?? 0) + (totals?.loanRepayments ?? 0))}
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Deductions + loan repayments
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Total Net Pay</span>
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totals?.netPay ?? 0)}
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                After all deductions
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Total Hours</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {((totals?.regularHours ?? 0) + (totals?.overtimeHours ?? 0)).toFixed(1)}h
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                {(totals?.overtimeHours ?? 0).toFixed(1)}h overtime
              </p>
            </div>
          </>
        )}
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center" onClick={() => toggleSort('name')}>
                    Name <SortIcon column="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  Pay Type
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('regularHours')}>
                    Regular Hrs <SortIcon column="regularHours" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('overtimeHours')}>
                    OT Hrs <SortIcon column="overtimeHours" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('grossPay')}>
                    Gross Pay <SortIcon column="grossPay" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('totalDeductions')}>
                    Deductions <SortIcon column="totalDeductions" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('netPay')}>
                    Net Pay <SortIcon column="netPay" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-20 ml-auto" /></td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-400 dark:text-neutral-500">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>No payroll data for this period</p>
                  </td>
                </tr>
              ) : (
                sorted.map((emp) => (
                  <tr key={emp.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/payroll/${emp.id}`}
                        className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-[#ee7a14] transition-colors"
                      >
                        {emp.name}
                      </Link>
                      <div className="text-xs text-neutral-400">{formatRole(emp.role)}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                        {emp.payType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-700 dark:text-neutral-300">
                      {emp.regularHours.toFixed(1)}h
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-700 dark:text-neutral-300">
                      {emp.overtimeHours > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">{emp.overtimeHours.toFixed(1)}h</span>
                      ) : (
                        '0.0h'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(emp.grossPay)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-600 dark:text-red-400">
                      {emp.totalDeductions + emp.loanRepayments > 0
                        ? `-${formatCurrency(emp.totalDeductions + emp.loanRepayments)}`
                        : '$0.00'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(emp.netPay)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
