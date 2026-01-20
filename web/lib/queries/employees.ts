import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Employee } from '@/lib/api';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: string) => [...employeeKeys.lists(), { filters }] as const,
};

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: () => api.employees.list(),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Partial<Employee> & { email: string; password: string }
    ) => api.employees.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}
