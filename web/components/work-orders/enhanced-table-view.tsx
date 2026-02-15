'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Eye,
  ChevronRight,
  Clock,
  ShieldAlert,
  Sparkles,
  FileText,
  Bell,
  Package,
  MessageSquare,
  UserPlus,
  AlertTriangle,
  Zap,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useUpdateWorkOrderStatus } from '@/lib/queries/work-orders';
import { useToast } from '@/components/ui/use-toast';
import type { WorkOrderWithAI, SlaRisk, ActionKey } from '@/lib/ai/work-order-ai';

interface EnhancedTableViewProps {
  workOrders: WorkOrderWithAI[];
}

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

const slaConfig: Record<SlaRisk, { bg: string; text: string }> = {
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  med: { bg: 'bg-amber-100', text: 'text-amber-700' },
  high: { bg: 'bg-red-100', text: 'text-red-700' },
};

const actionIcons: Record<ActionKey, React.ElementType> = {
  generate_estimate: FileText,
  send_reminder: Bell,
  order_parts: Package,
  update_customer: MessageSquare,
  assign_tech: UserPlus,
  escalate: AlertTriangle,
};

function PriorityCell({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-red-600 bg-red-50' :
    score >= 60 ? 'text-amber-600 bg-amber-50' :
    score >= 40 ? 'text-blue-600 bg-blue-50' :
    'text-emerald-600 bg-emerald-50';

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md', color)}>
      {score}
    </span>
  );
}

function AgentActionsCell({ wo }: { wo: WorkOrderWithAI }) {
  const updateStatus = useUpdateWorkOrderStatus();
  const { toast } = useToast();
  const [executed, setExecuted] = useState<string | null>(null);

  const topAction = wo.ai.nextBestActions[0];
  if (!topAction) return null;

  const Icon = actionIcons[topAction.key];

  const handleExecute = async () => {
    setExecuted(topAction.key);
    // Simulate action
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast({
      title: `${topAction.label} completed`,
      description: topAction.reason,
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-7 text-[11px] gap-1 px-2',
          executed ? 'text-emerald-600' : 'text-neutral-600 hover:text-neutral-900'
        )}
        onClick={handleExecute}
        disabled={!!executed}
      >
        <Icon className="w-3 h-3" />
        {executed ? 'Done' : topAction.label}
      </Button>
      {wo.ai.nextBestActions.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-neutral-400">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-neutral-500">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-500" />
                AI Recommended Actions
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {wo.ai.nextBestActions.slice(1).map((action) => {
              const ActionIcon = actionIcons[action.key];
              return (
                <DropdownMenuItem
                  key={action.key}
                  className="cursor-pointer"
                  onClick={() => {
                    toast({
                      title: `${action.label} initiated`,
                      description: action.reason,
                    });
                  }}
                >
                  <ActionIcon className="mr-2 h-3.5 w-3.5 text-neutral-500" />
                  <div>
                    <div className="text-sm">{action.label}</div>
                    <div className="text-[10px] text-neutral-400 max-w-[200px] truncate">{action.reason}</div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function RowActions({ wo }: { wo: WorkOrderWithAI }) {
  const updateStatus = useUpdateWorkOrderStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-neutral-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-neutral-500">Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/work-orders/${wo.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-neutral-500">Update Status</DropdownMenuLabel>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => updateStatus.mutate({ id: wo.id, status: option.value })}
            disabled={wo.status === option.value}
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

const columns: ColumnDef<WorkOrderWithAI>[] = [
  {
    accessorKey: 'ai.priorityScore',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => <PriorityCell score={row.original.ai.priorityScore} />,
    sortingFn: (a, b) => a.original.ai.priorityScore - b.original.ai.priorityScore,
  },
  {
    accessorKey: 'vehicle',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
    cell: ({ row }) => {
      const vehicle = row.original.vehicle;
      return vehicle ? (
        <div>
          <div className="font-medium text-neutral-900 text-sm">
            {vehicle.make} {vehicle.model}
          </div>
          {vehicle.year && (
            <div className="text-xs text-neutral-500">{vehicle.year}</div>
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
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const colors = statusColors[status] || statusColors.DIAGNOSED;
      return (
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border',
          colors.bg, colors.text, colors.border
        )}>
          {status.replace('_', ' ')}
        </span>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'ai.slaRisk',
    header: ({ column }) => <DataTableColumnHeader column={column} title="SLA" />,
    cell: ({ row }) => {
      const risk = row.original.ai.slaRisk;
      const config = slaConfig[risk];
      return (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full', config.bg, config.text)}>
          {risk === 'high' && <ShieldAlert className="w-3 h-3" />}
          {risk.toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: 'ai.revenueEstimate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Revenue" />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-emerald-600">
        {formatCurrency(row.original.ai.revenueEstimate)}
      </span>
    ),
    sortingFn: (a, b) => a.original.ai.revenueEstimate - b.original.ai.revenueEstimate,
  },
  {
    accessorKey: 'ai.marginEstimatePct',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Margin" />,
    cell: ({ row }) => {
      const margin = row.original.ai.marginEstimatePct;
      return (
        <span className={cn(
          'text-sm font-medium',
          margin >= 50 ? 'text-emerald-600' : margin >= 35 ? 'text-amber-600' : 'text-red-600'
        )}>
          {margin}%
        </span>
      );
    },
  },
  {
    accessorKey: 'ai.predictedEta',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ETA" />,
    cell: ({ row }) => {
      const eta = row.original.ai.predictedEta;
      const isOverdue = eta === 'Overdue';
      return (
        <span className={cn(
          'inline-flex items-center gap-1 text-xs',
          isOverdue ? 'text-red-600 font-bold' : 'text-neutral-600'
        )}>
          <Clock className="w-3 h-3" />
          {eta}
        </span>
      );
    },
  },
  {
    accessorKey: 'ai.blockers',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Blockers" />,
    cell: ({ row }) => {
      const blockers = row.original.ai.blockers;
      if (blockers.length === 0) {
        return <span className="text-xs text-emerald-500">Clear</span>;
      }
      return (
        <div className="flex gap-1 flex-wrap">
          {blockers.map((b) => (
            <span key={b} className="text-[9px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              {b}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: 'agent_actions',
    header: () => (
      <div className="flex items-center gap-1 text-xs font-medium">
        <Zap className="w-3 h-3 text-violet-500" />
        Agent
      </div>
    ),
    cell: ({ row }) => <AgentActionsCell wo={row.original} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions wo={row.original} />,
  },
];

export function EnhancedTableView({ workOrders }: EnhancedTableViewProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg">
      <DataTable
        columns={columns}
        data={workOrders}
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
    </div>
  );
}
