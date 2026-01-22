'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const columns: ColumnDef<WorkOrder>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: 'vehicle',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
    cell: ({ row }) => {
      const vehicle = row.original.vehicle;
      return vehicle ? (
        <div>
          <div className="font-medium">
            {vehicle.make} {vehicle.model}
          </div>
          {vehicle.year && (
            <div className="text-sm text-muted-foreground">{vehicle.year}</div>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
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
      <div className="max-w-[300px] truncate">{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === 'COMPLETED'
              ? 'success'
              : status === 'IN_PROGRESS'
              ? 'warning'
              : status === 'APPROVED'
              ? 'default'
              : 'secondary'
          }
        >
          {status.replace('_', ' ')}
        </Badge>
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
      return date ? formatDate(date) : '-';
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
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/work-orders/${workOrder.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={workOrder.status === option.value}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function WorkOrdersPage() {
  const { data: workOrders, isLoading } = useWorkOrders();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage repair orders and track progress
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </div>

      <NewWorkOrderModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      {isLoading ? (
        <div className="space-y-4">
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
  );
}
