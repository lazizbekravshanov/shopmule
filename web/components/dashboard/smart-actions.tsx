'use client'

import { motion } from 'framer-motion'
import {
  Zap,
  FileText,
  Phone,
  Package,
  AlertTriangle,
  Clock,
  Send,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartAction {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  urgency: 'high' | 'medium' | 'low'
  href: string
  badge?: string
}

const smartActions: SmartAction[] = [
  {
    id: '1',
    icon: AlertTriangle,
    label: 'Follow up on estimates',
    description: '3 estimates pending over 48hrs',
    urgency: 'high',
    href: '/invoices?status=pending',
    badge: '3',
  },
  {
    id: '2',
    icon: Package,
    label: 'Reorder parts',
    description: '5 items below reorder point',
    urgency: 'high',
    href: '/inventory?filter=low-stock',
    badge: '5',
  },
  {
    id: '3',
    icon: Phone,
    label: 'Customer callbacks',
    description: 'Ready for pickup notifications',
    urgency: 'medium',
    href: '/customers?filter=ready',
    badge: '2',
  },
  {
    id: '4',
    icon: FileText,
    label: 'Create invoice',
    description: 'WO-1044 completed, ready to bill',
    urgency: 'medium',
    href: '/work-orders/WO-1044',
  },
  {
    id: '5',
    icon: Clock,
    label: 'Schedule follow-ups',
    description: 'PM reminders for fleet customers',
    urgency: 'low',
    href: '/customers?filter=pm-due',
    badge: '8',
  },
]

const urgencyConfig = {
  high: {
    bg: 'bg-red-50 hover:bg-red-100',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-500',
  },
  medium: {
    bg: 'bg-amber-50 hover:bg-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-500',
  },
  low: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-500',
  },
}

export function SmartActions() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">Smart Actions</h3>
            <p className="text-xs text-neutral-500">Context-aware tasks</p>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="divide-y divide-neutral-100">
        {smartActions.map((action, index) => {
          const config = urgencyConfig[action.urgency]
          const Icon = action.icon

          return (
            <motion.a
              key={action.id}
              href={action.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center gap-3 px-5 py-3 transition-colors group',
                config.bg
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border',
                config.border,
                config.bg
              )}>
                <Icon className={cn('w-4 h-4', config.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900">
                    {action.label}
                  </span>
                  {action.badge && (
                    <span className={cn(
                      'px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full',
                      config.badge
                    )}>
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 truncate">
                  {action.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
            </motion.a>
          )
        })}
      </div>

      {/* AI Suggestion Footer */}
      <div className="px-5 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-t border-violet-100">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-violet-700">
            AI prioritized based on urgency & revenue impact
          </span>
        </div>
      </div>
    </div>
  )
}
