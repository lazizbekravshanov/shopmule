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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { JobsChart } from '@/components/charts/jobs-chart';
import { StatusDistribution } from '@/components/charts/status-distribution';
import { useRevenueReport } from '@/lib/queries/reports';
import { useWorkOrders } from '@/lib/queries/work-orders';
import { useLowStockParts } from '@/lib/queries/inventory';
import { formatCurrency } from '@/lib/utils';

// Static chart data (in real app, this would come from API)
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
  const { data: workOrders, isLoading: workOrdersLoading } = useWorkOrders();
  const { data: lowStockParts, isLoading: lowStockLoading } = useLowStockParts();

  const openWorkOrders = workOrders?.filter(
    (wo) => wo.status !== 'COMPLETED'
  ).length ?? 0;

  const statusData = [
    {
      name: 'Diagnosed',
      value: workOrders?.filter((wo) => wo.status === 'DIAGNOSED').length ?? 0,
      color: '#64748b',
    },
    {
      name: 'Approved',
      value: workOrders?.filter((wo) => wo.status === 'APPROVED').length ?? 0,
      color: '#3b82f6',
    },
    {
      name: 'In Progress',
      value: workOrders?.filter((wo) => wo.status === 'IN_PROGRESS').length ?? 0,
      color: '#f59e0b',
    },
    {
      name: 'Completed',
      value: workOrders?.filter((wo) => wo.status === 'COMPLETED').length ?? 0,
      color: '#22c55e',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/work-orders/new">
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(revenue?.total ?? 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {revenue?.count ?? 0} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {workOrdersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{openWorkOrders}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {workOrders?.length ?? 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(workOrders?.map((wo) => wo.vehicle?.customerId)).size || 0}
            </div>
            <p className="text-xs text-muted-foreground">With open orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{lowStockParts?.length ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Need reorder</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueChart data={revenueData} />
        </div>
        <div className="col-span-3">
          <StatusDistribution data={statusData} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <JobsChart data={jobsData} />

        {/* Recent Work Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Work Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/work-orders">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {workOrdersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {workOrders?.slice(0, 5).map((wo) => (
                  <div
                    key={wo.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {wo.vehicle?.make} {wo.vehicle?.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
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
                  </div>
                ))}
                {(!workOrders || workOrders.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">
                    No work orders yet
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
