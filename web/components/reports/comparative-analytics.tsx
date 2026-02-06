'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  TrendingUp,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComparisonMetric {
  label: string
  current: number
  previous: number
  format: 'currency' | 'percent' | 'number' | 'hours'
}

interface ComparisonPeriod {
  label: string
  value: string
}

const PERIODS: ComparisonPeriod[] = [
  { label: 'vs Last Week', value: 'week' },
  { label: 'vs Last Month', value: 'month' },
  { label: 'vs Last Quarter', value: 'quarter' },
  { label: 'vs Last Year', value: 'year' },
]

function formatValue(value: number, format: ComparisonMetric['format']): string {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'hours':
      return `${value.toFixed(1)}h`
    default:
      return value.toLocaleString()
  }
}

function MetricRow({ metric, index }: { metric: ComparisonMetric; index: number }) {
  const change = metric.previous !== 0
    ? ((metric.current - metric.previous) / metric.previous) * 100
    : 0
  const isPositive = change > 0
  const isNegative = change < 0
  const isNeutral = change === 0

  // For some metrics, negative is good (like comeback rate)
  const negativeIsGood = metric.label.toLowerCase().includes('comeback') ||
                         metric.label.toLowerCase().includes('return') ||
                         metric.label.toLowerCase().includes('error')

  const getChangeColor = () => {
    if (isNeutral) return 'text-neutral-500 bg-neutral-50'
    if (negativeIsGood) {
      return isNegative ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
    }
    return isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
  }

  const barWidth = Math.min(100, Math.abs(change) * 2)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="py-4 border-b border-neutral-100 last:border-0"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-700">{metric.label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400">
            {formatValue(metric.previous, metric.format)}
          </span>
          <span className="text-sm text-neutral-400">→</span>
          <span className="text-sm font-semibold text-neutral-900">
            {formatValue(metric.current, metric.format)}
          </span>
        </div>
      </div>

      {/* Change Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={cn(
              "h-full rounded-full",
              isPositive && !negativeIsGood && "bg-green-500",
              isNegative && !negativeIsGood && "bg-red-500",
              isPositive && negativeIsGood && "bg-red-500",
              isNegative && negativeIsGood && "bg-green-500",
              isNeutral && "bg-neutral-300"
            )}
          />
        </div>
        <span className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded",
          getChangeColor()
        )}>
          {isPositive && <ArrowUpRight className="w-3 h-3" />}
          {isNegative && <ArrowDownRight className="w-3 h-3" />}
          {isNeutral && <Minus className="w-3 h-3" />}
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    </motion.div>
  )
}

export function ComparativeAnalytics({ metrics }: { metrics: ComparisonMetric[] }) {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[1])
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  // Calculate overall performance
  const improvements = metrics.filter(m => {
    const change = m.previous !== 0 ? ((m.current - m.previous) / m.previous) * 100 : 0
    return change > 0
  }).length

  const declines = metrics.filter(m => {
    const change = m.previous !== 0 ? ((m.current - m.previous) / m.previous) * 100 : 0
    return change < 0
  }).length

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Period Comparison</h3>
              <p className="text-xs text-neutral-500">Performance trends over time</p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4 text-neutral-500" />
              {selectedPeriod.label}
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showPeriodDropdown && "rotate-180"
              )} />
            </button>

            <AnimatePresence>
              {showPeriodDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg z-10"
                >
                  {PERIODS.map(period => (
                    <button
                      key={period.value}
                      onClick={() => {
                        setSelectedPeriod(period)
                        setShowPeriodDropdown(false)
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 transition-colors first:rounded-t-lg last:rounded-b-lg",
                        selectedPeriod.value === period.value && "bg-neutral-50 font-medium"
                      )}
                    >
                      {period.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Metrics List */}
      <div className="px-5 py-2">
        {metrics.map((metric, index) => (
          <MetricRow key={metric.label} metric={metric} index={index} />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-neutral-600">
                <span className="font-semibold text-green-600">{improvements}</span> improvements
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-red-500" />
              <span className="text-neutral-600">
                <span className="font-semibold text-red-600">{declines}</span> declines
              </span>
            </div>
          </div>
          <span className="text-xs text-neutral-400">
            Data from {selectedPeriod.label.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  )
}

// Sample data generator
export function getSampleComparisonMetrics(): ComparisonMetric[] {
  return [
    { label: 'Total Revenue', current: 127450, previous: 113280, format: 'currency' },
    { label: 'Work Orders Completed', current: 156, previous: 142, format: 'number' },
    { label: 'Average Ticket Size', current: 817, previous: 798, format: 'currency' },
    { label: 'Labor Hours Billed', current: 312, previous: 298, format: 'hours' },
    { label: 'Shop Efficiency', current: 87, previous: 82, format: 'percent' },
    { label: 'Parts Margin', current: 32.5, previous: 30.8, format: 'percent' },
    { label: 'Comeback Rate', current: 2.3, previous: 3.1, format: 'percent' },
    { label: 'Customer Satisfaction', current: 94, previous: 91, format: 'percent' },
  ]
}

export type { ComparisonMetric, ComparisonPeriod }
