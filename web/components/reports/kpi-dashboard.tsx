'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Clock,
  Wrench,
  Users,
  Zap,
  Target,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPIData {
  label: string
  value: string
  change: number
  changeLabel: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ComponentType<{ className?: string }>
  color: 'green' | 'blue' | 'purple' | 'amber' | 'red'
  sparklineData?: number[]
}

const colorConfig = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    gradient: 'from-green-500 to-emerald-400',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    gradient: 'from-blue-500 to-indigo-400',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    gradient: 'from-purple-500 to-violet-400',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-400',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    gradient: 'from-red-500 to-rose-400',
  },
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 60
    const y = 20 - ((value - min) / range) * 16
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="w-16 h-6" viewBox="0 0 60 24">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function KPICard({ kpi, index }: { kpi: KPIData; index: number }) {
  const config = colorConfig[kpi.color]
  const Icon = kpi.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
          config.gradient
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {kpi.sparklineData && (
          <Sparkline
            data={kpi.sparklineData}
            color={kpi.trend === 'up' ? '#22c55e' : kpi.trend === 'down' ? '#ef4444' : '#6b7280'}
          />
        )}
      </div>

      <p className="text-sm text-neutral-500 mb-1">{kpi.label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-neutral-900">{kpi.value}</p>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          kpi.trend === 'up' && "text-green-600",
          kpi.trend === 'down' && "text-red-600",
          kpi.trend === 'stable' && "text-neutral-500"
        )}>
          {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {kpi.trend === 'stable' && <Minus className="w-3 h-3" />}
          <span>{kpi.change > 0 ? '+' : ''}{kpi.change}%</span>
        </div>
      </div>
      <p className="text-xs text-neutral-400 mt-1">{kpi.changeLabel}</p>
    </motion.div>
  )
}

export function KPIDashboard({ kpis }: { kpis: KPIData[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.label} kpi={kpi} index={index} />
      ))}
    </div>
  )
}

// Pre-configured KPI sets
export function RevenueKPIs() {
  const kpis: KPIData[] = [
    {
      label: 'Total Revenue',
      value: '$127,450',
      change: 12.5,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: DollarSign,
      color: 'green',
      sparklineData: [45, 52, 48, 61, 55, 67, 72],
    },
    {
      label: 'Avg Ticket Size',
      value: '$847',
      change: 8.3,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: Target,
      color: 'blue',
      sparklineData: [720, 780, 810, 790, 830, 850, 847],
    },
    {
      label: 'Labor Revenue',
      value: '$68,200',
      change: -2.1,
      changeLabel: 'vs last month',
      trend: 'down',
      icon: Wrench,
      color: 'purple',
      sparklineData: [72, 68, 71, 65, 69, 66, 68],
    },
    {
      label: 'Parts Revenue',
      value: '$59,250',
      change: 15.8,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: Zap,
      color: 'amber',
      sparklineData: [45, 48, 52, 55, 58, 57, 59],
    },
  ]

  return <KPIDashboard kpis={kpis} />
}

export function EfficiencyKPIs() {
  const kpis: KPIData[] = [
    {
      label: 'Shop Efficiency',
      value: '87%',
      change: 5.2,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: Zap,
      color: 'green',
      sparklineData: [78, 80, 82, 85, 84, 86, 87],
    },
    {
      label: 'Billable Hours',
      value: '312h',
      change: 3.8,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: Clock,
      color: 'blue',
      sparklineData: [280, 290, 295, 302, 308, 310, 312],
    },
    {
      label: 'Avg Tech Efficiency',
      value: '92%',
      change: 0,
      changeLabel: 'vs last month',
      trend: 'stable',
      icon: Users,
      color: 'purple',
      sparklineData: [90, 91, 92, 91, 92, 92, 92],
    },
    {
      label: 'Comeback Rate',
      value: '2.3%',
      change: -0.8,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: AlertTriangle,
      color: 'amber',
      sparklineData: [4, 3.5, 3.2, 2.8, 2.5, 2.4, 2.3],
    },
  ]

  return <KPIDashboard kpis={kpis} />
}

export type { KPIData }
