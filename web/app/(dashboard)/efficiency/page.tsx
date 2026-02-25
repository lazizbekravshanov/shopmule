'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEfficiency } from '@/lib/queries/efficiency';
import { formatCurrency } from '@/lib/utils';
import type { TechEfficiency } from '@/lib/api';

type Period = 'week' | 'month' | 'quarter' | 'year';

const PERIODS: { label: string; value: Period }[] = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

type SortKey = 'name' | 'clockedHours' | 'billedHours' | 'efficiency' | 'revenue' | 'jobsCompleted';

function efficiencyColor(pct: number) {
  if (pct >= 100) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 80) return 'text-blue-600 dark:text-blue-400';
  if (pct >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function efficiencyBarColor(pct: number) {
  if (pct >= 100) return 'bg-emerald-500';
  if (pct >= 80) return 'bg-blue-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

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

export default function EfficiencyPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [sortKey, setSortKey] = useState<SortKey>('efficiency');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useEfficiency(period);
  const summary = data?.summary;
  const techs = data?.technicians ?? [];

  const sorted = useMemo(() => {
    return [...techs].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = (a[sortKey] as number) - (b[sortKey] as number);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [techs, sortKey, sortDir]);

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
      ['Technician', 'Role', 'Clocked Hours', 'Billed Hours', 'Efficiency %', 'Revenue', 'Jobs Completed', 'Clocked In'],
      ...sorted.map((t) => [
        t.name,
        formatRole(t.role),
        String(t.clockedHours),
        String(t.billedHours),
        String(t.efficiency),
        String(t.revenue),
        String(t.jobsCompleted),
        t.isClockedIn ? 'Yes' : 'No',
      ]),
    ];
    downloadCsv(`efficiency-${period}.csv`, rows);
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
            Efficiency
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Technician productivity &amp; billable efficiency
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
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Shop Efficiency</span>
              </div>
              <div className={`text-3xl font-bold ${efficiencyColor(summary?.shopEfficiency ?? 0)}`}>
                {summary?.shopEfficiency ?? 0}%
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                {summary?.techCount ?? 0} technicians
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Total Billed Hours</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {summary?.totalBilledHours ?? 0}h
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Billable labor
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Total Clocked Hours</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {summary?.totalClockedHours ?? 0}h
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Time on the clock
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Revenue Generated</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(summary?.totalRevenue ?? 0)}
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Labor revenue
              </p>
            </div>
          </>
        )}
      </div>

      {/* Technician Table */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center" onClick={() => toggleSort('name')}>
                    Technician <SortIcon column="name" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('clockedHours')}>
                    Clocked Hrs <SortIcon column="clockedHours" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('billedHours')}>
                    Billed Hrs <SortIcon column="billedHours" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400 min-w-[180px]">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('efficiency')}>
                    Efficiency <SortIcon column="efficiency" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('revenue')}>
                    Revenue <SortIcon column="revenue" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <button className="flex items-center justify-end ml-auto" onClick={() => toggleSort('jobsCompleted')}>
                    Jobs <SortIcon column="jobsCompleted" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-10 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-400 dark:text-neutral-500">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>No technician data for this period</p>
                  </td>
                </tr>
              ) : (
                sorted.map((tech) => (
                  <TechRow key={tech.id} tech={tech} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TechRow({ tech }: { tech: TechEfficiency }) {
  const barWidth = Math.min(tech.efficiency, 150);

  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {tech.photoUrl ? (
            <img
              src={tech.photoUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {tech.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">{tech.name}</div>
            <div className="text-xs text-neutral-400">{formatRole(tech.role)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300 tabular-nums">
        {tech.clockedHours}h
      </td>
      <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300 tabular-nums">
        {tech.billedHours}h
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          <div className="w-24 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${efficiencyBarColor(tech.efficiency)}`}
              style={{ width: `${Math.min((barWidth / 150) * 100, 100)}%` }}
            />
          </div>
          <span className={`font-semibold tabular-nums min-w-[3rem] text-right ${efficiencyColor(tech.efficiency)}`}>
            {tech.efficiency}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300 tabular-nums">
        {formatCurrency(tech.revenue)}
      </td>
      <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300 tabular-nums">
        {tech.jobsCompleted}
      </td>
      <td className="px-4 py-3 text-center">
        {tech.isClockedIn ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Clocked In
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400">
            Off
          </span>
        )}
      </td>
    </tr>
  );
}
