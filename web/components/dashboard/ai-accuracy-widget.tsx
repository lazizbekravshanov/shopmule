'use client';

import { useQuery } from '@tanstack/react-query';
import { Brain, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccuracyData {
  totalDiagnoses: number;
  totalFeedback: number;
  accuracyRate: number | null;
  matchRate: number | null;
  breakdown: Record<string, number>;
}

export function AIAccuracyWidget() {
  const { data, isLoading } = useQuery<AccuracyData>({
    queryKey: ['ai-accuracy'],
    queryFn: async () => {
      const res = await fetch('/api/ai/accuracy');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 animate-pulse">
        <div className="h-4 w-32 bg-neutral-200 rounded mb-4" />
        <div className="h-8 w-16 bg-neutral-200 rounded" />
      </div>
    );
  }

  if (!data || data.totalDiagnoses === 0) {
    return (
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
        <div className="flex items-center gap-2 text-neutral-500 mb-2">
          <Brain className="h-4 w-4" />
          <span className="text-sm font-medium">AI Accuracy</span>
        </div>
        <p className="text-xs text-neutral-400">No AI diagnoses yet. Run your first diagnosis to start tracking.</p>
      </div>
    );
  }

  const accuracyColor = data.accuracyRate === null
    ? 'text-neutral-400'
    : data.accuracyRate >= 80
      ? 'text-emerald-600'
      : data.accuracyRate >= 60
        ? 'text-amber-600'
        : 'text-red-600';

  const breakdownBars = [
    { key: 'SPOT_ON', label: 'Spot On', color: 'bg-emerald-500' },
    { key: 'MOSTLY_RIGHT', label: 'Mostly Right', color: 'bg-blue-500' },
    { key: 'PARTIALLY_RIGHT', label: 'Partial', color: 'bg-amber-500' },
    { key: 'WRONG', label: 'Wrong', color: 'bg-red-500' },
  ];

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
      <div className="flex items-center gap-2 text-neutral-500 mb-4">
        <Brain className="h-4 w-4" />
        <span className="text-sm font-medium">AI Diagnostic Accuracy</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className={cn('text-2xl font-bold', accuracyColor)}>
            {data.accuracyRate !== null ? `${data.accuracyRate}%` : '—'}
          </div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Accuracy</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{data.totalDiagnoses}</div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Diagnoses</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{data.totalFeedback}</div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Rated</div>
        </div>
      </div>

      {data.totalFeedback > 0 && (
        <div className="space-y-1.5">
          {breakdownBars.map((bar) => {
            const count = data.breakdown[bar.key] || 0;
            const pct = data.totalFeedback > 0 ? (count / data.totalFeedback) * 100 : 0;
            return (
              <div key={bar.key} className="flex items-center gap-2 text-xs">
                <span className="w-20 text-neutral-500 text-right">{bar.label}</span>
                <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', bar.color)} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-neutral-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {data.matchRate !== null && (
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-neutral-500">
            Repair matched AI suggestion in <span className="font-medium text-neutral-700 dark:text-neutral-300">{data.matchRate}%</span> of cases
          </span>
        </div>
      )}
    </div>
  );
}
