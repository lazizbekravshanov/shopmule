'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Eye, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkOrders, useUpdateWorkOrderStatus } from '@/lib/queries/work-orders';
import { type WorkOrder } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { NewWorkOrderModal } from '@/components/work-orders/new-work-order-modal';

const statusOptions = [
  { label: 'Diagnosed', value: 'DIAGNOSED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  DIAGNOSED: { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200' },
  APPROVED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  IN_PROGRESS: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const columns: ColumnDef<WorkOrder>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-neutral-500">{row.original.id.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: 'vehicle',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
    cell: ({ row }) => {
      const vehicle = row.original.vehicle;
      return vehicle ? (
        <div>
          <div className="font-medium text-neutral-900">
            {vehicle.make} {vehicle.model}
          </div>
          {vehicle.year && (
            <div className="text-sm text-neutral-500">{vehicle.year}</div>
          )}
        </div>
      ) : (
        <span className="text-neutral-400">—</span>
      );
    },
    filterFn: (row, id, value) => {
      const vehicle = row.original.vehicle;
      if (!vehicle) return false;
      const searchValue = `${vehicle.make} ${vehicle.model}`.toLowerCase();
      return searchValue.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-neutral-600">{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const colors = statusColors[status] || statusColors.DIAGNOSED;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {status.replace('_', ' ')}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date ? (
        <span className="text-neutral-500">{formatDate(date)}</span>
      ) : (
        <span className="text-neutral-400">—</span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <WorkOrderActions workOrder={row.original} />,
  },
];

function WorkOrderActions({ workOrder }: { workOrder: WorkOrder }) {
  const updateStatus = useUpdateWorkOrderStatus();

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ id: workOrder.id, status });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-neutral-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-neutral-200">
        <DropdownMenuLabel className="text-neutral-500 text-xs font-medium">Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/work-orders/${workOrder.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-100" />
        <DropdownMenuLabel className="text-neutral-500 text-xs font-medium">Update Status</DropdownMenuLabel>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={workOrder.status === option.value}
            className="cursor-pointer"
          >
            <ChevronRight className="mr-2 h-3 w-3 text-neutral-400" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function WorkOrdersPage() {
  const { data: workOrders, isLoading, error, refetch, isFetching } = useWorkOrders();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Work Orders</h1>
          <p className="text-neutral-500 mt-1">
            Manage repair orders and track progress
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>
      </div>

      <NewWorkOrderModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      {/* Stats Summary */}
      {!isLoading && workOrders && (
        <div className="grid grid-cols-4 gap-4">
          {statusOptions.map((status) => {
            const count = workOrders.filter((wo) => wo.status === status.value).length;
            const colors = statusColors[status.value];
            return (
              <div
                key={status.value}
                className="bg-white border border-neutral-200 rounded-lg p-4"
              >
                <div className="text-sm text-neutral-500">{status.label}</div>
                <div className={`text-2xl font-semibold mt-1 ${colors.text}`}>{count}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-neutral-200 rounded-lg">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={workOrders ?? []}
            searchKey="vehicle"
            searchPlaceholder="Search vehicles..."
            filterableColumns={[
              {
                id: 'status',
                title: 'Status',
                options: statusOptions,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
