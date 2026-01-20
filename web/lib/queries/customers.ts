import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Customer, type Vehicle } from '@/lib/api';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: string) => [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: () => api.customers.list(),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => api.customers.get(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Customer>) => api.customers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      ...data
    }: {
      customerId: string;
    } & Partial<Vehicle>) => api.customers.addVehicle(customerId, data),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
