'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  FileText,
  Bell,
  Package,
  MessageSquare,
  UserPlus,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { AIRecommendation, ActionKey, SlaRisk } from '@/lib/ai/work-order-ai';
import { useUpdateWorkOrderStatus } from '@/lib/queries/work-orders';
import { useToast } from '@/components/ui/use-toast';

interface AIActionsViewProps {
  recommendations: AIRecommendation[];
}

const actionIcons: Record<ActionKey, React.ElementType> = {
  generate_estimate: FileText,
  send_reminder: Bell,
  order_parts: Package,
  update_customer: MessageSquare,
  assign_tech: UserPlus,
  escalate: AlertTriangle,
};

const actionColors: Record<ActionKey, string> = {
  generate_estimate: 'bg-blue-500',
  send_reminder: 'bg-amber-500',
  order_parts: 'bg-orange-500',
  update_customer: 'bg-sky-500',
  assign_tech: 'bg-violet-500',
  escalate: 'bg-red-500',
};

const slaConfig: Record<SlaRisk, { label: string; className: string }> = {
  low: { label: 'Low Risk', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  med: { label: 'Med Risk', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  high: { label: 'High Risk', className: 'bg-red-100 text-red-700 border-red-200' },
};

export function AIActionsView({ recommendations }: AIActionsViewProps) {
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const updateStatus = useUpdateWorkOrderStatus();
  const { toast } = useToast();

  const handleAction = async (rec: AIRecommendation) => {
    const actionId = rec.id;
    setLoadingActions((prev) => new Set(prev).add(actionId));

    // Simulate AI action execution
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // For some actions, actually do real mutations
    if (rec.action.key === 'generate_estimate') {
      updateStatus.mutate(
        { id: rec.workOrderId, status: 'DIAGNOSED' },
        {
          onSuccess: () => {
            toast({
              title: 'Estimate generated',
              description: `Estimate created for WO ${rec.workOrderId.slice(0, 8)}`,
            });
          },
        }
      );
    } else {
      // Simulated success for other actions
      toast({
        title: `${rec.action.label} completed`,
        description: rec.reason,
      });
    }

    setLoadingActions((prev) => {
      const next = new Set(prev);
      next.delete(actionId);
      return next;
    });
    setExecutedActions((prev) => new Set(prev).add(actionId));
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900">All caught up</h3>
        <p className="text-neutral-500 mt-1">No AI actions needed right now. Great work!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            {recommendations.length} Recommended Actions
          </h3>
          <p className="text-xs text-neutral-500">
            Ranked by priority score and revenue impact
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <AnimatePresence>
        {recommendations.map((rec, i) => {
          const Icon = actionIcons[rec.action.key];
          const iconBg = actionColors[rec.action.key];
          const sla = slaConfig[rec.slaRisk];
          const isExecuted = executedActions.has(rec.id);
          const isLoading = loadingActions.has(rec.id);
          const vehicle = rec.workOrder.vehicle;

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: isExecuted ? 0.5 : 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'bg-white border border-neutral-200 rounded-xl p-4 transition-all',
                isExecuted && 'opacity-50',
                !isExecuted && 'hover:border-neutral-300 hover:shadow-sm'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Rank + Icon */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-400">#{i + 1}</span>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900">
                          {rec.action.label}
                        </span>
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full border', sla.className)}>
                          {sla.label}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">
                          Score {rec.priorityScore}
                        </span>
                      </div>

                      {/* Work Order context */}
                      <div className="flex items-center gap-2 mt-1">
                        <Link
                          href={`/work-orders/${rec.workOrderId}`}
                          className="text-xs text-[#ee7a14] hover:underline font-medium"
                        >
                          WO {rec.workOrderId.slice(0, 8)}
                        </Link>
                        {vehicle && (
                          <span className="text-xs text-neutral-500">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </span>
                        )}
                        <span className="text-xs text-neutral-400">|</span>
                        <span className="text-xs font-medium text-emerald-600">
                          {formatCurrency(rec.revenueAtStake)}
                        </span>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-violet-400" />
                        <span className="text-xs font-medium text-violet-600">
                          {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400">confidence</span>
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    {rec.reason}
                  </p>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      disabled={isExecuted || isLoading}
                      onClick={() => handleAction(rec)}
                      className={cn(
                        'h-8 text-xs gap-1.5',
                        isExecuted
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Executing...
                        </>
                      ) : isExecuted ? (
                        <>
                          <Check className="w-3 h-3" />
                          Done
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3" />
                          Execute
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="h-8 text-xs text-neutral-500"
                    >
                      <Link href={`/work-orders/${rec.workOrderId}`}>
                        View WO
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
