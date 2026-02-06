'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Download,
  RefreshCw,
  FileText,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  TrendingUp
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
import { useRevenueReport } from '@/lib/queries/reports';
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
  getSampleTechRankings,
  ReportInsights,
  getSampleInsights,
} from '@/components/reports';

// Static data for charts (in real app, would come from API)
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
  { month: 'Jul', revenue: 72000 },
  { month: 'Aug', revenue: 68000 },
  { month: 'Sep', revenue: 74000 },
  { month: 'Oct', revenue: 82000 },
  { month: 'Nov', revenue: 78000 },
  { month: 'Dec', revenue: 91000 },
];

const dateRanges = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This Year', value: 'ytd' },
  { label: 'All Time', value: 'all' },
];

export default function ReportsPage() {
  const { data: revenue, isLoading: revenueLoading, refetch, isFetching } = useRevenueReport();
  const { data: employees } = useEmployees();
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data
  const heatmapData = generateSampleHeatmapData();
  const comparisonMetrics = getSampleComparisonMetrics();
  const techRankings = getSampleTechRankings();
  const insights = getSampleInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Reports</h1>
          <p className="text-neutral-500 mt-1">
            Analytics, insights, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] border-neutral-200">
              <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
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
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-neutral-100 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="data-[state=active]:bg-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Efficiency
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-white">
            <Users className="w-4 h-4 mr-2" />
            Team
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* AI Insights */}
          <ReportInsights insights={insights} />

          {/* KPI Dashboard */}
          <RevenueKPIs />

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />

            {/* Comparative Analytics */}
            <ComparativeAnalytics metrics={comparisonMetrics} />
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue KPIs */}
          <RevenueKPIs />

          {/* Revenue Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              {revenueLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(revenue?.total ?? 0)}
                </div>
              )}
              <p className="text-xs text-neutral-400 mt-1">
                {revenue?.count ?? 0} invoices
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Avg Ticket</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900">$847</div>
              <p className="text-xs text-green-600 mt-1">+8.3% vs last month</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Labor Revenue</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900">$68,200</div>
              <p className="text-xs text-neutral-400 mt-1">54% of total</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Parts Revenue</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900">$59,250</div>
              <p className="text-xs text-green-600 mt-1">+15.8% vs last month</p>
            </motion.div>
          </div>

          {/* Revenue Chart */}
          <RevenueChart data={revenueData} />

          {/* Period Comparison */}
          <ComparativeAnalytics metrics={comparisonMetrics} />
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          {/* Efficiency KPIs */}
          <EfficiencyKPIs />

          {/* Utilization Heatmap */}
          <UtilizationHeatmap data={heatmapData} />

          {/* Comparison */}
          <ComparativeAnalytics metrics={comparisonMetrics.filter(m =>
            ['Shop Efficiency', 'Labor Hours Billed', 'Comeback Rate', 'Customer Satisfaction'].includes(m.label)
          )} />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          {/* Team Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Active Techs</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900">
                {employees?.filter(e => e.status === 'active').length ?? 0}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Avg Efficiency</span>
              </div>
              <div className="text-3xl font-bold text-green-600">92%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Total Hours</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900">312h</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Revenue/Tech</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900">$21.2k</div>
            </motion.div>
          </div>

          {/* Technician Leaderboard */}
          <TechLeaderboard rankings={techRankings} />

          {/* Utilization by Tech */}
          <UtilizationHeatmap data={heatmapData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
