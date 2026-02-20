import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Employee, type CertificationData, type EmployeePerformance } from '@/lib/api';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: string) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  certifications: (id: string) => [...employeeKeys.all, 'certifications', id] as const,
  performance: (id: string, period?: string) => [...employeeKeys.all, 'performance', id, period] as const,
};

export function useEmployees(params?: { role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: () => api.employees.list(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => api.employees.get(id),
    enabled: !!id,
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

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      api.employees.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.employees.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useCertifications(employeeId: string) {
  return useQuery({
    queryKey: employeeKeys.certifications(employeeId),
    queryFn: () => api.employees.certifications.list(employeeId),
    enabled: !!employeeId,
  });
}

export function useAddCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      data,
    }: {
      employeeId: string;
      data: Omit<CertificationData, 'id' | 'isActive'>;
    }) => api.employees.certifications.add(employeeId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.certifications(variables.employeeId),
      });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.employeeId),
      });
    },
  });
}

export function useRemoveCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      certId,
    }: {
      employeeId: string;
      certId: string;
    }) => api.employees.certifications.remove(employeeId, certId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.certifications(variables.employeeId),
      });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.employeeId),
      });
    },
  });
}

export function useEmployeePerformance(id: string, period?: string) {
  return useQuery({
    queryKey: employeeKeys.performance(id, period),
    queryFn: () => api.employees.performance(id, period),
    enabled: !!id,
  });
}
