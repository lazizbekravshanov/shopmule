'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Star,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerHealth {
  id: string
  name: string
  type: 'fleet' | 'individual'
  healthScore: number
  trend: 'up' | 'down' | 'stable'
  lastVisit: string
  totalRevenue: number
  openOrders: number
  riskFactors?: string[]
}

const customers: CustomerHealth[] = [
  {
    id: '1',
    name: 'ABC Trucking Co',
    type: 'fleet',
    healthScore: 92,
    trend: 'up',
    lastVisit: '2 days ago',
    totalRevenue: 48500,
    openOrders: 2,
  },
  {
    id: '2',
    name: 'Johnson Logistics',
    type: 'fleet',
    healthScore: 78,
    trend: 'stable',
    lastVisit: '1 week ago',
    totalRevenue: 32100,
    openOrders: 1,
  },
  {
    id: '3',
    name: 'Mike\'s Transport',
    type: 'individual',
    healthScore: 45,
    trend: 'down',
    lastVisit: '3 weeks ago',
    totalRevenue: 8400,
    openOrders: 0,
    riskFactors: ['No visit in 21 days', 'Declined last estimate'],
  },
  {
    id: '4',
    name: 'Regional Freight LLC',
    type: 'fleet',
    healthScore: 88,
    trend: 'up',
    lastVisit: '4 days ago',
    totalRevenue: 67200,
    openOrders: 3,
  },
  {
    id: '5',
    name: 'Dave\'s Hauling',
    type: 'individual',
    healthScore: 62,
    trend: 'down',
    lastVisit: '2 weeks ago',
    totalRevenue: 12300,
    openOrders: 0,
    riskFactors: ['Overdue invoice'],
  },
]

function HealthScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getTextColor = () => {
    if (score >= 80) return 'text-green-700'
    if (score >= 60) return 'text-amber-700'
    return 'text-red-700'
  }

  const getBgColor = () => {
    if (score >= 80) return 'bg-green-50'
    if (score >= 60) return 'bg-amber-50'
    return 'bg-red-50'
  }

  return (
    <div className={cn('flex items-center gap-2 px-2 py-1 rounded-lg', getBgColor())}>
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score * 0.88} 88`}
            className={getTextColor()}
          />
        </svg>
        <span className={cn(
          'absolute inset-0 flex items-center justify-center text-[10px] font-bold',
          getTextColor()
        )}>
          {score}
        </span>
      </div>
    </div>
  )
}

export function CustomerHealth() {
  const avgHealthScore = Math.round(
    customers.reduce((sum, c) => sum + c.healthScore, 0) / customers.length
  )
  const atRiskCount = customers.filter(c => c.healthScore < 60).length

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Customer Health</h3>
              <p className="text-xs text-neutral-500">Relationship insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-neutral-500">Avg Score</p>
              <p className="text-lg font-semibold text-neutral-900">{avgHealthScore}</p>
            </div>
            {atRiskCount > 0 && (
              <div className="px-2 py-1 bg-red-50 rounded-lg">
                <p className="text-xs font-medium text-red-700">{atRiskCount} at risk</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="divide-y divide-neutral-100">
        {customers.map((customer, index) => (
          <motion.a
            key={customer.id}
            href={`/customers/${customer.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors group"
          >
            <HealthScoreBadge score={customer.healthScore} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-900 truncate">
                  {customer.name}
                </span>
                {customer.type === 'fleet' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                    Fleet
                  </span>
                )}
                {customer.trend === 'up' && (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                )}
                {customer.trend === 'down' && (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-neutral-500">
                  ${customer.totalRevenue.toLocaleString()} lifetime
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500">
                  {customer.lastVisit}
                </span>
                {customer.openOrders > 0 && (
                  <>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-blue-600 font-medium">
                      {customer.openOrders} open
                    </span>
                  </>
                )}
              </div>
              {customer.riskFactors && customer.riskFactors.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] text-red-600">
                    {customer.riskFactors[0]}
                  </span>
                </div>
              )}
            </div>

            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
          </motion.a>
        ))}
      </div>

      {/* Footer */}
      <a
        href="/customers"
        className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
      >
        View all customers
        <ArrowUpRight className="w-3 h-3" />
      </a>
    </div>
  )
}
