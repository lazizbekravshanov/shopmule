import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ServiceTemplate } from '@/lib/api';

const keys = {
  all: ['templates'] as const,
  list: () => [...keys.all, 'list'] as const,
  detail: (id: string) => [...keys.all, 'detail', id] as const,
};

export function useTemplates() {
  return useQuery({
    queryKey: keys.list(),
    queryFn: () => api.templates.list(),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<ServiceTemplate, 'id'>) => api.templates.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.list() }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<ServiceTemplate> & { id: string }) =>
      api.templates.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.list() }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.list() }),
  });
}
