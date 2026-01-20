import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type TimeEntry } from '@/lib/api';

export const timeKeys = {
  all: ['time'] as const,
  timesheet: (employeeId: string) => [...timeKeys.all, 'timesheet', employeeId] as const,
};

export function useTimesheet(employeeId: string) {
  return useQuery({
    queryKey: timeKeys.timesheet(employeeId),
    queryFn: () => api.time.timesheet(employeeId),
    enabled: !!employeeId,
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) => api.time.clockIn({ employeeId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeKeys.timesheet(data.employeeId) });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.time.clockOut(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeKeys.timesheet(data.employeeId) });
    },
  });
}
