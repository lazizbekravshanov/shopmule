import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Part } from '@/lib/api';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  lowStock: () => [...inventoryKeys.all, 'low-stock'] as const,
};

export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: () => api.inventory.list(),
  });
}

export function useLowStockParts() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => api.inventory.lowStock(),
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Part>) => api.inventory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      api.inventory.adjust(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
    },
  });
}
