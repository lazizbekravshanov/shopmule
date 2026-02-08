'use client';

import Link from 'next/link';
import { Wrench, Calendar, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

type WorkOrderStatus = 'DIAGNOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';

interface WorkOrderCardProps {
  workOrder: {
    id: string;
    status: WorkOrderStatus;
    description: string;
    createdAt: string;
    laborTotal: number;
    partsTotal: number;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      year?: number | null;
      licensePlate?: string | null;
    } | null;
  };
  token: string;
  showVehicle?: boolean;
}

const statusConfig: Record<
  WorkOrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  DIAGNOSED: { label: 'Awaiting Approval', variant: 'destructive' },
  APPROVED: { label: 'Approved', variant: 'secondary' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'outline' },
};

export function WorkOrderCard({
  workOrder,
  token,
  showVehicle = true,
}: WorkOrderCardProps) {
  const config = statusConfig[workOrder.status];
  const total = workOrder.laborTotal + workOrder.partsTotal;
  const vehicleName = workOrder.vehicle
    ? [workOrder.vehicle.year, workOrder.vehicle.make, workOrder.vehicle.model]
        .filter(Boolean)
        .join(' ')
    : null;

  return (
    <Link href={`/portal/${token}/work-orders/${workOrder.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-muted rounded-lg">
                <Wrench className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <p className="font-medium line-clamp-2">{workOrder.description}</p>
                {showVehicle && vehicleName && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Car className="h-3 w-3" />
                    {vehicleName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(workOrder.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(total)}</p>
              <p className="text-xs text-muted-foreground">Estimate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
