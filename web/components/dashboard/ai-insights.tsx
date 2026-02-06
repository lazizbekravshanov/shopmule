'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'success' | 'tip'
  title: string
  description: string
  metric?: string
  trend?: 'up' | 'down'
  action?: {
    label: string
    href: string
  }
  priority: number
}

// Simulated AI-generated insights based on shop data patterns
const generateInsights = (): Insight[] => [
  {
    id: '1',
    type: 'opportunity',
    title: 'Revenue opportunity detected',
    description: 'Brake services up 23% this month. Consider promoting brake packages.',
    metric: '+$4,200 potential',
    trend: 'up',
    action: { label: 'Create promotion', href: '/marketing' },
    priority: 1,
  },
  {
    id: '2',
    type: 'warning',
    title: '3 work orders aging',
    description: 'Orders #1042, #1038, #1035 pending over 48 hours. Customer satisfaction at risk.',
    action: { label: 'View orders', href: '/work-orders?status=pending' },
    priority: 2,
  },
  {
    id: '3',
    type: 'success',
    title: 'Technician efficiency improved',
    description: 'Average job completion time down 12% vs last month.',
    metric: '-18 min/job',
    trend: 'down',
    priority: 3,
  },
  {
    id: '4',
    type: 'tip',
    title: 'Optimize parts ordering',
    description: 'Bulk ordering brake pads could save 15% based on usage patterns.',
    metric: '$340/month savings',
    action: { label: 'Review inventory', href: '/inventory' },
    priority: 4,
  },
  {
    id: '5',
    type: 'opportunity',
    title: 'Fleet customer expansion',
    description: 'ABC Trucking increased orders 40%. Good candidate for service contract.',
    action: { label: 'View customer', href: '/customers' },
    priority: 5,
  },
]

const insightConfig = {
  opportunity: {
    icon: Lightbulb,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
  },
  success: {
    icon: CheckCircle2,
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
  },
  tip: {
    icon: Sparkles,
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
  },
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setInsights(generateInsights())
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setInsights(generateInsights())
      setDismissedIds(new Set())
      setIsRefreshing(false)
    }, 1000)
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id))
  }

  const visibleInsights = insights
    .filter(i => !dismissedIds.has(i.id))
    .slice(0, expanded ? undefined : 3)

  const hasMore = insights.filter(i => !dismissedIds.has(i.id)).length > 3

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">AI Insights</h3>
            <p className="text-xs text-neutral-500">Smart recommendations</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4 text-neutral-500', isRefreshing && 'animate-spin')} />
        </button>
      </div>

      {/* Insights List */}
      <div className="divide-y divide-neutral-100">
        <AnimatePresence mode="popLayout">
          {visibleInsights.map((insight, index) => {
            const config = insightConfig[insight.type]
            const Icon = config.icon

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="relative group"
              >
                <div className="px-5 py-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      config.bg
                    )}>
                      <Icon className={cn('w-4 h-4', config.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-neutral-900 text-sm">
                          {insight.title}
                        </h4>
                        <button
                          onClick={() => handleDismiss(insight.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-200 rounded transition-all"
                        >
                          <X className="w-3 h-3 text-neutral-400" />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {insight.metric && (
                          <span className={cn(
                            'text-xs font-medium flex items-center gap-1',
                            config.text
                          )}>
                            {insight.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                            {insight.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                            {insight.metric}
                          </span>
                        )}
                        {insight.action && (
                          <a
                            href={insight.action.href}
                            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-0.5 transition-colors"
                          >
                            {insight.action.label}
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Show More */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
        >
          {expanded ? 'Show less' : `Show ${insights.filter(i => !dismissedIds.has(i.id)).length - 3} more insights`}
        </button>
      )}
    </div>
  )
}
