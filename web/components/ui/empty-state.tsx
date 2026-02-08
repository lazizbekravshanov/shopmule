'use client';

import {
  FileText,
  Users,
  Wrench,
  Package,
  Clock,
  Search,
  Plus,
  Car,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-4 mb-4">
        <Icon className="h-8 w-8 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoWorkOrders({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Wrench}
      title="No work orders"
      description="Get started by creating your first work order."
      action={onCreateNew ? { label: 'New Work Order', onClick: onCreateNew } : undefined}
    />
  );
}

export function NoCustomers({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No customers yet"
      description="Add your first customer to get started."
      action={onCreateNew ? { label: 'Add Customer', onClick: onCreateNew } : undefined}
    />
  );
}

export function NoInvoices({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No invoices"
      description="Create your first invoice from a work order."
      action={onCreateNew ? { label: 'Create Invoice', onClick: onCreateNew } : undefined}
    />
  );
}

export function NoInventory({ onAddItem }: { onAddItem?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No inventory items"
      description="Start tracking your parts and supplies."
      action={onAddItem ? { label: 'Add Item', onClick: onAddItem } : undefined}
    />
  );
}

export function NoVehicles({ onAddVehicle }: { onAddVehicle?: () => void }) {
  return (
    <EmptyState
      icon={Car}
      title="No vehicles"
      description="Add a vehicle to this customer's profile."
      action={onAddVehicle ? { label: 'Add Vehicle', onClick: onAddVehicle } : undefined}
    />
  );
}

export function NoTimeEntries() {
  return (
    <EmptyState
      icon={Clock}
      title="No time entries"
      description="Clock in to start tracking your time."
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`No results match "${query}". Try adjusting your search.`}
    />
  );
}

export function NoData({ message }: { message?: string }) {
  return (
    <EmptyState
      icon={FileText}
      title="No data available"
      description={message || "There's nothing to show here yet."}
    />
  );
}
