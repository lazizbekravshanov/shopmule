'use client';

import Link from 'next/link';
import {
  DollarSign,
  Wrench,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { JobsChart } from '@/components/charts/jobs-chart';
import { StatusDistribution } from '@/components/charts/status-distribution';
import { useRevenueReport } from '@/lib/queries/reports';
import { useWorkOrdersSummary } from '@/lib/queries/work-orders';
import { useLowStockCount } from '@/lib/queries/inventory';
import { formatCurrency } from '@/lib/utils';

const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const jobsData = [
  { month: 'Jan', completed: 45, inProgress: 12 },
  { month: 'Feb', completed: 52, inProgress: 15 },
  { month: 'Mar', completed: 48, inProgress: 8 },
  { month: 'Apr', completed: 61, inProgress: 20 },
  { month: 'May', completed: 55, inProgress: 14 },
  { month: 'Jun', completed: 67, inProgress: 18 },
];

export default function DashboardPage() {
  const { data: revenue, isLoading: revenueLoading } = useRevenueReport();
  const { data: workOrderSummary, isLoading: workOrdersLoading } =
    useWorkOrdersSummary(5);
  const { data: lowStockCount, isLoading: lowStockLoading } = useLowStockCount();

  const openWorkOrders = workOrderSummary?.open ?? 0;
  const totalWorkOrders = workOrderSummary?.total ?? 0;
  const activeCustomers = workOrderSummary?.activeCustomers ?? 0;

  const statusData = [
    {
      name: 'Diagnosed',
      value: workOrderSummary?.byStatus?.DIAGNOSED ?? 0,
      color: '#78716c',
    },
    {
      name: 'Approved',
      value: workOrderSummary?.byStatus?.APPROVED ?? 0,
      color: '#57534e',
    },
    {
      name: 'In Progress',
      value: workOrderSummary?.byStatus?.IN_PROGRESS ?? 0,
      color: '#ee7a14',
    },
    {
      name: 'Completed',
      value: workOrderSummary?.byStatus?.COMPLETED ?? 0,
      color: '#10b981',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-neutral-500 mt-1">
            Overview of your shop performance
          </p>
        </div>
        <Button
          asChild
          className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
        >
          <Link href="/work-orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <Link
          href="/invoices"
          className="bg-white border border-neutral-200 rounded-lg p-5 transition-all hover:border-neutral-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-500">
              Total Revenue
            </span>
            <DollarSign className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
          </div>
          {revenueLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold text-neutral-900 tracking-tight">
              {formatCurrency(revenue?.total ?? 0)}
            </div>
          )}
          <p className="text-xs text-neutral-400 mt-1">
            {revenue?.count ?? 0} invoices
          </p>
        </Link>

        {/* Work Orders */}
        <Link
          href="/work-orders"
          className="bg-white border border-neutral-200 rounded-lg p-5 transition-all hover:border-neutral-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-500">
              Open Work Orders
            </span>
            <Wrench className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
          </div>
          {workOrdersLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold text-neutral-900 tracking-tight">
              {openWorkOrders}
            </div>
          )}
          <p className="text-xs text-neutral-400 mt-1">{totalWorkOrders} total</p>
        </Link>

        {/* Customers */}
        <Link
          href="/customers"
          className="bg-white border border-neutral-200 rounded-lg p-5 transition-all hover:border-neutral-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-500">
              Active Customers
            </span>
            <Users className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tracking-tight">
            {activeCustomers}
          </div>
          <p className="text-xs text-neutral-400 mt-1">With open orders</p>
        </Link>

        {/* Low Stock */}
        <Link
          href="/inventory"
          className={`bg-white border rounded-lg p-5 transition-all hover:shadow-sm ${
            (lowStockCount?.count ?? 0) > 0
              ? 'border-red-200 hover:border-red-300 bg-red-50'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${(lowStockCount?.count ?? 0) > 0 ? 'text-red-600' : 'text-neutral-500'}`}>
              Low Stock Items
            </span>
            <AlertTriangle
              className={`h-4 w-4 ${(lowStockCount?.count ?? 0) > 0 ? 'text-red-500' : 'text-neutral-400'}`}
              strokeWidth={1.5}
            />
          </div>
          {lowStockLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className={`text-2xl font-bold tracking-tight ${(lowStockCount?.count ?? 0) > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
              {lowStockCount?.count ?? 0}
            </div>
          )}
          <p className="text-xs text-neutral-400 mt-1">Need reorder</p>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart data={revenueData} />
        </div>
        <div className="lg:col-span-3">
          <StatusDistribution data={statusData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <JobsChart data={jobsData} />

        {/* Recent Work Orders */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between p-5 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-900">Recent Work Orders</h3>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-neutral-500 hover:text-neutral-900"
            >
              <Link href="/work-orders">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="p-5">
            {workOrdersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {workOrderSummary?.recent.map((wo) => (
                  <Link
                    key={wo.id}
                    href={`/work-orders/${wo.id}`}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg transition-colors hover:bg-neutral-50"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {wo.vehicle?.make} {wo.vehicle?.model}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {wo.description.slice(0, 50)}...
                      </p>
                    </div>
                    <Badge
                      variant={
                        wo.status === 'COMPLETED'
                          ? 'success'
                          : wo.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {wo.status.replace('_', ' ')}
                    </Badge>
                  </Link>
                ))}
                {(!workOrderSummary || workOrderSummary.recent.length === 0) && (
                  <p className="text-center text-neutral-400 py-8">
                    No work orders yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
