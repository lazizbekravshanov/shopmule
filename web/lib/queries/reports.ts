import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const reportKeys = {
  all: ['reports'] as const,
  revenue: (params?: { from?: string; to?: string }) =>
    [...reportKeys.all, 'revenue', params] as const,
  breakdown: (range: string) => [...reportKeys.all, 'breakdown', range] as const,
  productivity: (employeeId: string) =>
    [...reportKeys.all, 'productivity', employeeId] as const,
  payroll: (employeeId: string) => [...reportKeys.all, 'payroll', employeeId] as const,
};

export function useRevenueReport(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: reportKeys.revenue(params),
    queryFn: () => api.reports.revenue(params),
  });
}

export function useBreakdownReport(range: string) {
  return useQuery({
    queryKey: reportKeys.breakdown(range),
    queryFn: () => api.reports.breakdown(range),
    staleTime: 2 * 60_000,
  });
}

export function useProductivityReport(employeeId: string) {
  return useQuery({
    queryKey: reportKeys.productivity(employeeId),
    queryFn: () => api.reports.productivity(employeeId),
    enabled: !!employeeId,
  });
}

export function usePayrollReport(employeeId: string) {
  return useQuery({
    queryKey: reportKeys.payroll(employeeId),
    queryFn: () => api.reports.payroll(employeeId),
    enabled: !!employeeId,
  });
}
