'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Inbox, ArrowRight, Clock, CheckCircle2, Loader2, Wrench, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface NetworkReq {
  id: string;
  sourceTenantId: string;
  type: string;
  title: string;
  description: string;
  partName: string | null;
  partNumber: string | null;
  vehicleInfo: string | null;
  urgency: string;
  status: string;
  respondedByTenantId: string | null;
  createdAt: string;
}

const URGENCY_COLORS: Record<string, string> = {
  LOW: 'bg-neutral-100 text-neutral-600',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  EMERGENCY: 'bg-red-100 text-red-700',
};

export function NetworkRequestsInbox() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ outgoing: NetworkReq[]; incoming: NetworkReq[] }>({
    queryKey: ['network-requests'],
    queryFn: async () => {
      const res = await fetch('/api/network/requests');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/network/requests/${requestId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLAIM' }),
      });
      if (!res.ok) throw new Error('Failed to claim');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-requests'] });
      toast({ title: 'Request claimed', description: 'You can now coordinate with the requesting shop.' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to claim request' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  const incoming = data?.incoming || [];
  const outgoing = data?.outgoing || [];

  return (
    <div className="space-y-6">
      {/* Incoming requests */}
      <div>
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
          <Inbox className="h-4 w-4" />
          Incoming Requests ({incoming.length})
        </h3>

        {incoming.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4 text-center">No incoming requests from nearby shops</p>
        ) : (
          <div className="space-y-2">
            {incoming.map((req) => (
              <div
                key={req.id}
                className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {req.type === 'PART_REQUEST' ? (
                      <Package className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Wrench className="h-4 w-4 text-[#ee7a14]" />
                    )}
                    <span className="text-sm font-medium">{req.title}</span>
                  </div>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', URGENCY_COLORS[req.urgency] || URGENCY_COLORS.NORMAL)}>
                    {req.urgency}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-2 line-clamp-2">{req.description}</p>
                {req.partName && <p className="text-xs text-neutral-400 mb-2">Part: {req.partName}</p>}
                {req.vehicleInfo && <p className="text-xs text-neutral-400 mb-2">Vehicle: {req.vehicleInfo}</p>}
                <Button
                  size="sm"
                  className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => claimMutation.mutate(req.id)}
                  disabled={claimMutation.isPending}
                >
                  {claimMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Claim This Request
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing requests */}
      {outgoing.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Your Requests ({outgoing.length})
          </h3>
          <div className="space-y-2">
            {outgoing.map((req) => (
              <div
                key={req.id}
                className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-medium">{req.title}</span>
                  <span className={cn(
                    'ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium',
                    req.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                    req.status === 'CLAIMED' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-neutral-100 text-neutral-600'
                  )}>
                    {req.status}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
