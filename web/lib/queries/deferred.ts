import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type DeferredWorkItem } from '@/lib/api';

const keys = {
  all: ['deferred'] as const,
  vehicle: (vehicleId: string) => [...keys.all, 'vehicle', vehicleId] as const,
};

export function useDeferredWork(vehicleId: string | undefined) {
  return useQuery({
    queryKey: keys.vehicle(vehicleId ?? ''),
    queryFn: () => api.deferred.list(vehicleId!),
    enabled: !!vehicleId,
    staleTime: 30_000,
  });
}

export function useCreateDeferred() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      vehicleId,
      ...payload
    }: {
      vehicleId: string;
      description: string;
      category?: string | null;
      estimatedCost?: number | null;
      declinedReason?: string | null;
      sourceWorkOrderId?: string | null;
    }) => api.deferred.create(vehicleId, payload),
    onSuccess: (_data, { vehicleId }) => {
      qc.invalidateQueries({ queryKey: keys.vehicle(vehicleId) });
    },
  });
}

export function usePatchDeferred() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      vehicleId: _vid,
      ...payload
    }: {
      id: string;
      vehicleId: string;
      status?: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'DISMISSED';
      resolvedWorkOrderId?: string | null;
    }) => api.deferred.patch(id, payload),
    onSuccess: (_data, { vehicleId }) => {
      qc.invalidateQueries({ queryKey: keys.vehicle(vehicleId) });
    },
  });
}
