'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortalData } from '../layout';
import { WorkOrderCard } from '@/components/portal';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'active' | 'completed';

export default function WorkOrdersPage() {
  const params = useParams();
  const token = params.token as string;
  const { workOrders } = usePortalData();

  const [filter, setFilter] = useState<Filter>('all');

  const filteredWorkOrders = workOrders.filter((wo) => {
    if (filter === 'active') return wo.status !== 'COMPLETED';
    if (filter === 'completed') return wo.status === 'COMPLETED';
    return true;
  });

  const activeCount = workOrders.filter((wo) => wo.status !== 'COMPLETED').length;
  const completedCount = workOrders.filter((wo) => wo.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <p className="text-muted-foreground">
          {workOrders.length} total work order{workOrders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={cn(filter === 'all' && 'bg-[#ee7a14] hover:bg-[#d96a0a]')}
        >
          All ({workOrders.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
          className={cn(filter === 'active' && 'bg-[#ee7a14] hover:bg-[#d96a0a]')}
        >
          Active ({activeCount})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
          className={cn(filter === 'completed' && 'bg-[#ee7a14] hover:bg-[#d96a0a]')}
        >
          Completed ({completedCount})
        </Button>
      </div>

      {filteredWorkOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No work orders</p>
          <p className="text-sm">
            {filter === 'active'
              ? 'No active work orders at the moment.'
              : filter === 'completed'
              ? 'No completed work orders yet.'
              : 'No work orders on file.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkOrders.map((wo) => (
            <WorkOrderCard key={wo.id} workOrder={wo} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
