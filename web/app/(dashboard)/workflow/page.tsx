'use client';

import { useWorkOrders } from '@/lib/queries/work-orders';
import { WorkflowBoard } from '@/components/workflow/workflow-board';
import type { WorkflowWorkOrder } from '@/components/workflow/workflow-card';
import { Loader2 } from 'lucide-react';

// Statuses that appear on the workflow board (excludes DRAFT, COMPLETED, CANCELLED, ARCHIVED, DIAGNOSED)
const WORKFLOW_STATUSES = new Set([
  'ESTIMATE',
  'ESTIMATE_SENT',
  'AWAITING_APPROVAL',
  'APPROVED',
  'IN_PROGRESS',
  'WAITING_ON_PARTS',
  'QUALITY_CHECK',
  'READY_FOR_PICKUP',
  'INVOICED',
]);

export default function WorkflowPage() {
  const { data: workOrders, isLoading, error } = useWorkOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-neutral-500">
        Failed to load work orders
      </div>
    );
  }

  const filtered = (workOrders ?? []).filter((wo) =>
    WORKFLOW_STATUSES.has(wo.status)
  );

  // Map from API WorkOrder type to WorkflowWorkOrder
  // The API type is a subset; extra fields come through at runtime from the API response
  const mapped: WorkflowWorkOrder[] = filtered.map((wo) => {
    const raw = wo as unknown as Record<string, unknown>;
    return {
      id: wo.id,
      workOrderNumber: (raw.workOrderNumber as string) ?? `WO-${wo.id.slice(0, 6)}`,
      status: wo.status,
      priority: (raw.priority as string) ?? 'NORMAL',
      description: wo.description,
      customerComplaint: (raw.customerComplaint as string) ?? null,
      laborTotal: (raw.laborTotal as number) ?? 0,
      partsTotal: wo.partsTotal ?? 0,
      grandTotal: (raw.grandTotal as number) ?? 0,
      promisedDate: (raw.promisedDate as string) ?? null,
      createdAt: wo.createdAt ?? new Date().toISOString(),
      vehicle: wo.vehicle
        ? { year: wo.vehicle.year, make: wo.vehicle.make ?? '', model: wo.vehicle.model ?? '' }
        : { year: null, make: 'Unknown', model: '' },
      customer: wo.vehicle?.customer
        ? { displayName: wo.vehicle.customer.name }
        : { displayName: 'Unknown Customer' },
      laborEntries: (wo.laborEntries ?? []).map((l) => ({ hours: l.hours })),
      parts: (wo.partsUsed ?? []).map((p) => ({
        quantity: p.quantity,
        partId: p.id,
      })),
      partsRequired: wo.partsUsed?.length ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Workflow
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Track work orders through your shop pipeline
        </p>
      </div>

      {/* Kanban Board */}
      <WorkflowBoard workOrders={mapped} />
    </div>
  );
}
