'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { useBreakdownReport } from '@/lib/queries/reports';
import { useEmployees } from '@/lib/queries/employees';
import { formatCurrency } from '@/lib/utils';
import {
  RevenueKPIs,
  EfficiencyKPIs,
  UtilizationHeatmap,
  generateSampleHeatmapData,
  ComparativeAnalytics,
  getSampleComparisonMetrics,
  TechLeaderboard,
  ReportInsights,
  getSampleInsights,
} from '@/components/reports';

const DATE_RANGES = [
  { label: 'Last 7 days',  value: '7d'  },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This Year',    value: 'ytd' },
  { label: 'All Time',     value: 'all' },
];

// ─── CSV export helper ────────────────────────────────────────────────────────
function downloadCsv(filename: string, rows: string[][]): void {
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Trend chip ───────────────────────────────────────────────────────────────
function Trend({ pct }: { pct: number }) {
  if (pct > 0)  return <span className="flex items-center text-xs text-emerald-600 font-medium"><TrendingUp className="h-3 w-3 mr-0.5" />+{pct}% vs prior period</span>;
  if (pct < 0)  return <span className="flex items-center text-xs text-red-500 font-medium"><TrendingDown className="h-3 w-3 mr-0.5" />{pct}% vs prior period</span>;
  return          <span className="flex items-center text-xs text-neutral-400"><Minus className="h-3 w-3 mr-0.5" />No change</span>;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function MetricSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [dateRange, setDateRange]   = useState('30d');
  const [activeTab, setActiveTab]   = useState('overview');
  const { data, isLoading, isFetching, refetch } = useBreakdownReport(dateRange);
  const { data: employees } = useEmployees();

  const s = data?.summary;

  // Build chart-ready monthly data
  const monthlyChartData = (data?.monthly ?? []).map((m) => ({
    month:   m.month,
    revenue: m.revenue,
  }));

  const handleExport = useCallback(() => {
    if (!data) return;

    if (activeTab === 'overview' || activeTab === 'revenue') {
      const rows: string[][] = [
        ['Month', 'Total Revenue', 'Labor Revenue', 'Parts Revenue'],
        ...(data.monthly.map((m) => [m.month, String(m.revenue), String(m.labor), String(m.parts)])),
      ];
      downloadCsv(`shopmule-revenue-${dateRange}.csv`, rows);
    } else if (activeTab === 'team') {
      const rows: string[][] = [
        ['Technician', 'Hours', 'Revenue'],
        ...(data.techPerformance.map((t) => [t.name, String(t.hours), String(t.revenue)])),
      ];
      downloadCsv(`shopmule-team-${dateRange}.csv`, rows);
    }
  }, [data, activeTab, dateRange]);

  // Build TechLeaderboard-compatible rankings from real data
  const techRankings = (data?.techPerformance ?? []).map((t, i) => ({
    id:           t.name, // use name as id since we don't have employee id here
    rank:         i + 1,
    previousRank: i + 1,
    name:         t.name,
    revenue:      t.revenue,
    billedHours:  t.hours,
    efficiency:   100,
    jobsCompleted: 0,
    comebackRate:  0,
    score:        t.revenue,
  }));

  // Sample data for heatmap / comparative (these need more data from server; use samples as placeholders)
  const heatmapData         = generateSampleHeatmapData();
  const comparisonMetrics   = getSampleComparisonMetrics();
  const insights            = getSampleInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Reports</h1>
          <p className="text-neutral-500 mt-1">Analytics, insights, and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] border-neutral-200">
              <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-neutral-200"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            className="border-neutral-200"
            onClick={handleExport}
            disabled={!data}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-neutral-100 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            <BarChart3 className="w-4 h-4 mr-2" />Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white">
            <DollarSign className="w-4 h-4 mr-2" />Revenue
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="data-[state=active]:bg-white">
            <TrendingUp className="w-4 h-4 mr-2" />Efficiency
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-white">
            <Users className="w-4 h-4 mr-2" />Team
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <ReportInsights insights={insights} />
          <RevenueKPIs />
          <div className="grid gap-6 lg:grid-cols-2">
            {isLoading ? (
              <>
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </>
            ) : (
              <>
                <RevenueChart data={monthlyChartData.length ? monthlyChartData : []} />
                <ComparativeAnalytics metrics={comparisonMetrics} />
              </>
            )}
          </div>
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue" className="space-y-6">
          <RevenueKPIs />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
            ) : (
              <>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-neutral-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Revenue</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {formatCurrency(s?.totalRevenue ?? 0)}
                  </div>
                  <div className="mt-1"><Trend pct={s?.revenueChange ?? 0} /></div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white border border-neutral-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm font-medium">Avg Ticket</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {formatCurrency(s?.avgTicket ?? 0)}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{s?.invoiceCount ?? 0} invoices</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white border border-neutral-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Labor Revenue</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {formatCurrency(s?.laborRevenue ?? 0)}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{s?.laborPct ?? 0}% of total</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white border border-neutral-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm font-medium">Parts Revenue</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {formatCurrency(s?.partsRevenue ?? 0)}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{s?.partsPct ?? 0}% of total</p>
                </motion.div>
              </>
            )}
          </div>

          {isLoading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <RevenueChart data={monthlyChartData.length ? monthlyChartData : []} />
          )}

          <ComparativeAnalytics metrics={comparisonMetrics} />
        </TabsContent>

        {/* Efficiency */}
        <TabsContent value="efficiency" className="space-y-6">
          <EfficiencyKPIs />
          <UtilizationHeatmap data={heatmapData} />
          <ComparativeAnalytics metrics={comparisonMetrics.filter((m) =>
            ['Shop Efficiency', 'Labor Hours Billed', 'Comeback Rate', 'Customer Satisfaction'].includes(m.label)
          )} />
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
            ) : (
              <>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-neutral-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Active Techs</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {employees?.filter((e) => e.status === 'active').length ?? 0}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white border border-neutral-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Labor Rev</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {formatCurrency(s?.laborRevenue ?? 0)}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white border border-neutral-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Hours</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {(data?.techPerformance ?? []).reduce((s, t) => s + t.hours, 0).toFixed(1)}h
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white border border-neutral-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Rev / Tech</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {techRankings.length > 0
                      ? formatCurrency(Math.round((s?.laborRevenue ?? 0) / techRankings.length))
                      : '—'}
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : techRankings.length > 0 ? (
            <TechLeaderboard rankings={techRankings} />
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center text-sm text-neutral-400">
              No labor data for this period
            </div>
          )}

          <UtilizationHeatmap data={heatmapData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
