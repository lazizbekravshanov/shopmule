'use client'

import { motion } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  DollarSign,
  Clock,
  Users,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'success' | 'recommendation'
  title: string
  description: string
  metric?: string
  impact?: string
  action?: string
  href?: string
}

const typeConfig = {
  opportunity: {
    icon: TrendingUp,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-500',
    text: 'text-blue-700',
    label: 'Opportunity',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-500',
    text: 'text-amber-700',
    label: 'Attention',
  },
  success: {
    icon: Target,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-500',
    text: 'text-green-700',
    label: 'Win',
  },
  recommendation: {
    icon: Lightbulb,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-500',
    text: 'text-purple-700',
    label: 'Recommendation',
  },
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const config = typeConfig[insight.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "rounded-xl border p-4 transition-all hover:shadow-sm",
        config.bg,
        config.border,
        insight.href && "cursor-pointer hover:scale-[1.01]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          config.iconBg
        )}>
          <Icon className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium", config.text)}>
              {config.label}
            </span>
            {insight.metric && (
              <span className="text-xs text-neutral-500">
                • {insight.metric}
              </span>
            )}
          </div>

          <h4 className="font-semibold text-neutral-900 text-sm mb-1">
            {insight.title}
          </h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {insight.description}
          </p>

          {insight.impact && (
            <div className="mt-2 flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">
                {insight.impact}
              </span>
            </div>
          )}

          {insight.action && (
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-neutral-700">
              <span>{insight.action}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function ReportInsights({ insights }: { insights: Insight[] }) {
  const opportunityCount = insights.filter(i => i.type === 'opportunity').length
  const warningCount = insights.filter(i => i.type === 'warning').length

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">AI Insights</h3>
              <p className="text-xs text-neutral-500">Smart recommendations based on your data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {opportunityCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg">
                {opportunityCount} opportunities
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg">
                {warningCount} attention
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="p-5 grid gap-4 md:grid-cols-2">
        {insights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} index={index} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-violet-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by ShopMule AI</span>
          </div>
          <span className="text-neutral-400">Updated 5 minutes ago</span>
        </div>
      </div>
    </div>
  )
}

// Sample insights
export function getSampleInsights(): Insight[] {
  return [
    {
      id: '1',
      type: 'opportunity',
      title: 'Underutilized capacity on Wednesdays',
      description: 'Your shop runs at 62% capacity on Wednesdays vs 89% on Tuesdays. Consider offering Wednesday specials or moving appointments.',
      metric: 'Utilization Report',
      impact: 'Potential +$4,200/month',
      action: 'View scheduling options',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Brake service comeback rate increasing',
      description: 'Comebacks for brake jobs have risen from 1.8% to 3.2% over the past month. Review procedures with the team.',
      metric: 'Quality Report',
      action: 'View affected work orders',
    },
    {
      id: '3',
      type: 'success',
      title: 'Parts margin improved by 4.2%',
      description: 'Your new vendor pricing is paying off. Parts margin increased from 28.3% to 32.5% this month.',
      metric: 'Profit Report',
      impact: '+$2,840 this month',
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Consider adding diesel diagnostic training',
      description: 'You\'ve declined 12 diesel diagnostic jobs this month. Adding this capability could capture $8,500+ in monthly revenue.',
      metric: 'Demand Analysis',
      impact: 'Est. $8,500+/month',
      action: 'View training options',
    },
  ]
}

export type { Insight }
