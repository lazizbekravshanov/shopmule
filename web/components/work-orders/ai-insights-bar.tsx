'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { AIInsights } from '@/lib/ai/work-order-ai';

interface AIInsightsBarProps {
  insights: AIInsights;
}

interface InsightCard {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  pulse: boolean;
}

export function AIInsightsBar({ insights }: AIInsightsBarProps) {
  const cards: InsightCard[] = [
    {
      label: 'SLA at Risk',
      value: String(insights.slaRiskCount),
      icon: ShieldAlert,
      color: insights.slaRiskCount > 0 ? 'text-red-600' : 'text-emerald-600',
      bgColor: insights.slaRiskCount > 0 ? 'bg-red-50' : 'bg-emerald-50',
      borderColor: insights.slaRiskCount > 0 ? 'border-red-200' : 'border-emerald-200',
      pulse: insights.slaRiskCount > 2,
    },
    {
      label: 'Pending Approvals',
      value: formatCurrency(insights.pendingApprovalsAmount),
      icon: DollarSign,
      color: insights.pendingApprovalsAmount > 0 ? 'text-amber-600' : 'text-emerald-600',
      bgColor: insights.pendingApprovalsAmount > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      borderColor: insights.pendingApprovalsAmount > 0 ? 'border-amber-200' : 'border-emerald-200',
      pulse: insights.pendingApprovalsAmount > 10000,
    },
    {
      label: 'Parts Blockers',
      value: String(insights.partsBlockersCount),
      icon: Package,
      color: insights.partsBlockersCount > 0 ? 'text-orange-600' : 'text-emerald-600',
      bgColor: insights.partsBlockersCount > 0 ? 'bg-orange-50' : 'bg-emerald-50',
      borderColor: insights.partsBlockersCount > 0 ? 'border-orange-200' : 'border-emerald-200',
      pulse: false,
    },
    {
      label: 'Awaiting Customer',
      value: String(insights.customersWaitingCount),
      icon: Clock,
      color: insights.customersWaitingCount > 0 ? 'text-blue-600' : 'text-emerald-600',
      bgColor: insights.customersWaitingCount > 0 ? 'bg-blue-50' : 'bg-emerald-50',
      borderColor: insights.customersWaitingCount > 0 ? 'border-blue-200' : 'border-emerald-200',
      pulse: false,
    },
    {
      label: 'Tech Overload',
      value: insights.techOverloadWarning
        ? insights.techOverloadNames.length > 0
          ? insights.techOverloadNames.slice(0, 2).join(', ')
          : 'Warning'
        : 'Normal',
      icon: insights.techOverloadWarning ? AlertTriangle : Users,
      color: insights.techOverloadWarning ? 'text-red-600' : 'text-emerald-600',
      bgColor: insights.techOverloadWarning ? 'bg-red-50' : 'bg-emerald-50',
      borderColor: insights.techOverloadWarning ? 'border-red-200' : 'border-emerald-200',
      pulse: insights.techOverloadWarning,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'relative rounded-xl border p-4 transition-all',
              card.bgColor,
              card.borderColor,
            )}
          >
            {card.pulse && (
              <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            )}
            <div className="flex items-center gap-2.5">
              <div className={cn('rounded-lg p-1.5', card.bgColor)}>
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
              <span className="text-xs font-medium text-neutral-500">{card.label}</span>
            </div>
            <div className={cn('mt-2 text-lg font-bold tracking-tight', card.color)}>
              {card.value}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
