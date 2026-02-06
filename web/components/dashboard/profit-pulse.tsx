'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricData {
  label: string
  value: number
  previousValue: number
  format: 'currency' | 'percent' | 'number'
}

const metrics: MetricData[] = [
  { label: 'Gross Margin', value: 42.3, previousValue: 38.7, format: 'percent' },
  { label: 'Avg Ticket', value: 847, previousValue: 792, format: 'currency' },
  { label: 'Parts Markup', value: 31.2, previousValue: 28.5, format: 'percent' },
  { label: 'Labor Rate', value: 125, previousValue: 125, format: 'currency' },
]

const profitBreakdown = [
  { category: 'Labor', revenue: 28400, cost: 12800, margin: 54.9 },
  { category: 'Parts', revenue: 18200, cost: 12740, margin: 30.0 },
  { category: 'Diagnostics', revenue: 4800, cost: 960, margin: 80.0 },
  { category: 'Inspections', revenue: 3200, cost: 640, margin: 80.0 },
]

function formatValue(value: number, format: 'currency' | 'percent' | 'number'): string {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'percent':
      return `${value.toFixed(1)}%`
    default:
      return value.toLocaleString()
  }
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const change = ((current - previous) / previous) * 100
  const isPositive = change > 0
  const isNeutral = change === 0

  if (isNeutral) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-neutral-500">
        <Minus className="w-3 h-3" />
        <span>0%</span>
      </span>
    )
  }

  return (
    <span className={cn(
      'flex items-center gap-0.5 text-xs font-medium',
      isPositive ? 'text-green-600' : 'text-red-600'
    )}>
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
    </span>
  )
}

export function ProfitPulse() {
  const [showBreakdown, setShowBreakdown] = useState(false)

  const totalRevenue = profitBreakdown.reduce((sum, item) => sum + item.revenue, 0)
  const totalCost = profitBreakdown.reduce((sum, item) => sum + item.cost, 0)
  const totalMargin = ((totalRevenue - totalCost) / totalRevenue) * 100

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">Profit Pulse</h3>
            <p className="text-xs text-neutral-500">Real-time margin tracking</p>
          </div>
        </div>
      </div>

      {/* Main Metric */}
      <div className="px-5 py-6 border-b border-neutral-100 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-neutral-500 mb-1">This Month's Gross Profit</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-900 tracking-tight">
                ${(totalRevenue - totalCost).toLocaleString()}
              </span>
              <span className="text-sm text-green-600 font-medium flex items-center gap-0.5">
                <TrendingUp className="w-4 h-4" />
                {totalMargin.toFixed(1)}% margin
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Revenue</p>
            <p className="text-lg font-semibold text-neutral-700">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100">
        {metrics.map((metric) => (
          <div key={metric.label} className="px-4 py-4">
            <p className="text-xs text-neutral-500 mb-1">{metric.label}</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold text-neutral-900">
                {formatValue(metric.value, metric.format)}
              </span>
              <TrendIndicator current={metric.value} previous={metric.previousValue} />
            </div>
          </div>
        ))}
      </div>

      {/* Expandable Breakdown */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full px-5 py-3 flex items-center justify-between text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
      >
        <span>View profit breakdown by category</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          showBreakdown && 'rotate-180'
        )} />
      </button>

      {showBreakdown && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-neutral-100"
        >
          <div className="divide-y divide-neutral-100">
            {profitBreakdown.map((item) => (
              <div key={item.category} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full bg-gradient-to-b from-green-400 to-green-600" style={{
                    opacity: item.margin / 100
                  }} />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{item.category}</p>
                    <p className="text-xs text-neutral-500">
                      ${item.revenue.toLocaleString()} revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {item.margin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-neutral-500">
                    ${(item.revenue - item.cost).toLocaleString()} profit
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
