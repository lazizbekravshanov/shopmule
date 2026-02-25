import { useQuery } from '@tanstack/react-query';
import { api, type EfficiencyReport } from '@/lib/api';

export const efficiencyKeys = {
  all: ['efficiency'] as const,
  report: (period: string) => [...efficiencyKeys.all, period] as const,
};

export function useEfficiency(period: string) {
  return useQuery<EfficiencyReport>({
    queryKey: efficiencyKeys.report(period),
    queryFn: () => api.efficiency.get(period),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
