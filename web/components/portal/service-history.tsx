'use client';

import { Wrench, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

type WorkOrderStatus = 'DIAGNOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';

interface ServiceHistoryProps {
  workOrders: {
    id: string;
    status: WorkOrderStatus;
    description: string;
    createdAt: string;
    laborTotal: number;
    partsTotal: number;
  }[];
  onSelect?: (id: string) => void;
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

export function ServiceHistory({ workOrders, onSelect }: ServiceHistoryProps) {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No service history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workOrders.map((wo) => {
        const config = statusConfig[wo.status];
        const total = wo.laborTotal + wo.partsTotal;

        return (
          <div
            key={wo.id}
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onSelect?.(wo.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <p className="font-medium line-clamp-2">{wo.description}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(wo.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
