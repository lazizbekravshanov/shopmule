import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type WorkOrder } from '@/lib/api';

export const workOrderKeys = {
  all: ['work-orders'] as const,
  lists: () => [...workOrderKeys.all, 'list'] as const,
  list: (filters: string) => [...workOrderKeys.lists(), { filters }] as const,
  details: () => [...workOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...workOrderKeys.details(), id] as const,
};

export function useWorkOrders() {
  return useQuery({
    queryKey: workOrderKeys.lists(),
    queryFn: () => api.workOrders.list(),
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: workOrderKeys.detail(id),
    queryFn: () => api.workOrders.get(id),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WorkOrder>) => api.workOrders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.workOrders.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
    },
  });
}

export function useAssignTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, employeeId }: { workOrderId: string; employeeId: string }) =>
      api.workOrders.assign(workOrderId, employeeId),
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
    },
  });
}

export function useAddLabor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workOrderId,
      ...data
    }: {
      workOrderId: string;
      employeeId: string;
      hours: number;
      rate: number;
      note?: string;
    }) => api.workOrders.addLabor(workOrderId, data),
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
    },
  });
}

export function useAddParts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workOrderId,
      ...data
    }: {
      workOrderId: string;
      partId: string;
      quantity: number;
      unitPrice: number;
      markupPct?: number;
    }) => api.workOrders.addParts(workOrderId, data),
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
    },
  });
}
