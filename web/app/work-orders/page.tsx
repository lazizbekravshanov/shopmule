'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  RefreshCw,
  Zap,
  Table2,
  Columns3,
  GanttChartSquare,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkOrders } from '@/lib/queries/work-orders';
import { NewWorkOrderModal } from '@/components/work-orders/new-work-order-modal';
import { AIInsightsBar } from '@/components/work-orders/ai-insights-bar';
import { ShopHealthScoreWidget } from '@/components/work-orders/shop-health-score';
import { AIActionsView } from '@/components/work-orders/ai-actions-view';
import { EnhancedTableView } from '@/components/work-orders/enhanced-table-view';
import { KanbanView } from '@/components/work-orders/kanban-view';
import { TimelineView } from '@/components/work-orders/timeline-view';
import {
  enrichWorkOrders,
  computeAIInsights,
  computeShopHealth,
  generateRecommendations,
} from '@/lib/ai/work-order-ai';
import { cn } from '@/lib/utils';

type ViewMode = 'ai-actions' | 'table' | 'kanban' | 'timeline';

const viewModes: { key: ViewMode; label: string; icon: React.ElementType }[] = [
  { key: 'ai-actions', label: 'AI Actions', icon: Zap },
  { key: 'table', label: 'Table', icon: Table2 },
  { key: 'kanban', label: 'Kanban', icon: Columns3 },
  { key: 'timeline', label: 'Timeline', icon: GanttChartSquare },
];

export default function WorkOrdersPage() {
  const { data: workOrders, isLoading, refetch, isFetching } = useWorkOrders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('ai-actions');

  // AI-enriched data — computed from real work order data
  const enriched = useMemo(
    () => (workOrders ? enrichWorkOrders(workOrders) : []),
    [workOrders]
  );

  const insights = useMemo(
    () => computeAIInsights(enriched),
    [enriched]
  );

  const shopHealth = useMemo(
    () => computeShopHealth(enriched),
    [enriched]
  );

  const recommendations = useMemo(
    () => generateRecommendations(enriched),
    [enriched]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Work Orders
            </h1>
            <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </span>
          </div>
          <p className="text-neutral-500 mt-0.5 text-sm">
            AI operations center — prioritized actions, signals, and automations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-neutral-200"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>
      </div>

      <NewWorkOrderModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* AI Insights Bar + Shop Health */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
            <AIInsightsBar insights={insights} />
            <ShopHealthScoreWidget health={shopHealth} />
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center bg-neutral-100 rounded-lg p-1 gap-0.5">
              {viewModes.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveView(key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md transition-all',
                    activeView === key
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {key === 'ai-actions' && recommendations.length > 0 && (
                    <span className="text-[10px] font-bold text-white bg-violet-500 px-1.5 py-0.5 rounded-full leading-none">
                      {recommendations.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Work Order Count */}
            <span className="text-sm text-neutral-500">
              {enriched.length} work order{enriched.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Active View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeView === 'ai-actions' && (
                <AIActionsView recommendations={recommendations} />
              )}
              {activeView === 'table' && (
                <EnhancedTableView workOrders={enriched} />
              )}
              {activeView === 'kanban' && (
                <KanbanView workOrders={enriched} />
              )}
              {activeView === 'timeline' && (
                <TimelineView workOrders={enriched} />
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
