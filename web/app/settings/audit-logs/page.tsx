'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  success: boolean;
  errorMessage: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ENTITY_TYPES = [
  'WorkOrder',
  'Invoice',
  'Customer',
  'Vehicle',
  'Part',
  'User',
  'Tenant',
  'Payment',
];

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  VIEW: 'Viewed',
  EXPORT: 'Exported',
};

function actionBadgeClass(action: string) {
  if (action === 'DELETE') return 'bg-red-100 text-red-700';
  if (action === 'CREATE') return 'bg-green-100 text-green-700';
  if (action === 'UPDATE') return 'bg-blue-100 text-blue-700';
  if (action === 'LOGIN' || action === 'LOGOUT') return 'bg-purple-100 text-purple-700';
  return 'bg-neutral-100 text-neutral-600';
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<string>('');
  const [successFilter, setSuccessFilter] = useState<string>('');

  const { data, isLoading, isFetching, refetch } = useQuery<AuditLogsResponse>({
    queryKey: ['audit-logs', page, entityType, successFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (entityType) params.set('entityType', entityType);
      if (successFilter) params.set('success', successFilter);
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
    staleTime: 30_000,
  });

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Audit Log</h1>
            <p className="text-neutral-500 mt-0.5 text-sm">
              {pagination ? `${pagination.total.toLocaleString()} events recorded` : 'Activity history'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-neutral-200"
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-lg">
        <Filter className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <span className="text-sm text-neutral-500 font-medium">Filter:</span>

        <Select
          value={entityType || 'all'}
          onValueChange={(v) => { setEntityType(v === 'all' ? '' : v); handleFilterChange(); }}
        >
          <SelectTrigger className="w-40 h-8 text-sm border-neutral-200">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entities</SelectItem>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={successFilter || 'all'}
          onValueChange={(v) => { setSuccessFilter(v === 'all' ? '' : v); handleFilterChange(); }}
        >
          <SelectTrigger className="w-36 h-8 text-sm border-neutral-200">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All results</SelectItem>
            <SelectItem value="true">Success only</SelectItem>
            <SelectItem value="false">Failures only</SelectItem>
          </SelectContent>
        </Select>

        {(entityType || successFilter) && (
          <button
            onClick={() => { setEntityType(''); setSuccessFilter(''); setPage(1); }}
            className="text-xs text-[#ee7a14] hover:underline ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">Time</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">Action</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">Entity</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">Result</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500 text-xs uppercase tracking-wide">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Shield className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">No audit events found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-neutral-700 text-xs">
                        {log.userEmail ?? <span className="text-neutral-400 italic">system</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', actionBadgeClass(log.action))}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <span className="font-medium text-neutral-700">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-neutral-400 ml-1 font-mono">{log.entityId.slice(0, 8)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {log.success ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          OK
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-xs" title={log.errorMessage ?? undefined}>
                          <XCircle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-xs font-mono">
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Page {pagination.page} of {pagination.totalPages} &mdash; {pagination.total.toLocaleString()} events
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isFetching}
                className="h-7 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages || isFetching}
                className="h-7 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
