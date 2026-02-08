'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Car, Wrench, FileText, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortalData } from './layout';
import { VehicleCard, WorkOrderCard, InvoiceSummary } from '@/components/portal';
import { formatCurrency } from '@/lib/utils';

export default function PortalDashboard() {
  const params = useParams();
  const token = params.token as string;
  const { summary, vehicles, workOrders, invoices } = usePortalData();

  const activeWorkOrders = workOrders.filter((wo) => wo.status !== 'COMPLETED');
  const unpaidInvoices = invoices.filter((inv) => inv.status !== 'PAID');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.activeWorkOrders}</p>
                <p className="text-sm text-muted-foreground">Active Work Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Car className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalVehicles}</p>
                <p className="text-sm text-muted-foreground">Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={summary.unpaidBalance > 0 ? 'border-orange-200 bg-orange-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${summary.unpaidBalance > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                <DollarSign className={`h-5 w-5 ${summary.unpaidBalance > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(summary.unpaidBalance)}</p>
                <p className="text-sm text-muted-foreground">Unpaid Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Work Orders */}
      {activeWorkOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Active Work Orders
              </CardTitle>
              <Link href={`/portal/${token}/work-orders`}>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeWorkOrders.slice(0, 3).map((wo) => (
              <WorkOrderCard key={wo.id} workOrder={wo} token={token} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Unpaid Invoices
              </CardTitle>
              <Link href={`/portal/${token}/invoices`}>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {unpaidInvoices.slice(0, 3).map((inv) => (
              <InvoiceSummary key={inv.id} invoice={inv} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Vehicles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5" />
              Your Vehicles
            </CardTitle>
            <Link href={`/portal/${token}/vehicles`}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No vehicles on file
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vehicles.slice(0, 4).map((v) => (
                <VehicleCard key={v.id} vehicle={v} token={token} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {activeWorkOrders.length === 0 && unpaidInvoices.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">You have no active work orders or unpaid invoices.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
