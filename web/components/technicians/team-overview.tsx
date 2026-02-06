'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Clock,
  Coffee,
  Wrench,
  TrendingUp,
  Zap,
  Target,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeamStats {
  total: number
  clockedIn: number
  onBreak: number
  available: number
  avgEfficiency: number
  totalHoursToday: number
  jobsInProgress: number
  jobsCompletedToday: number
}

export function TeamOverview({ stats }: { stats: TeamStats }) {
  const utilizationRate = Math.round((stats.clockedIn / stats.total) * 100)

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Team Overview</h3>
              <p className="text-xs text-neutral-500">Real-time workforce status</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            <p className="text-xs text-neutral-500">Team members</p>
          </div>
        </div>
      </div>

      {/* Status Pills */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700">Working</span>
            </div>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.clockedIn}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-3 h-3 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">On Break</span>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-1">{stats.onBreak}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-neutral-500" />
              <span className="text-xs font-medium text-neutral-600">Off</span>
            </div>
            <p className="text-2xl font-bold text-neutral-600 mt-1">{stats.available}</p>
          </motion.div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">Shop Utilization</span>
          <span className={cn(
            "text-sm font-bold",
            utilizationRate >= 80 ? "text-green-600" :
            utilizationRate >= 50 ? "text-amber-600" : "text-red-600"
          )}>
            {utilizationRate}%
          </span>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              utilizationRate >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
              utilizationRate >= 50 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
              "bg-gradient-to-r from-red-500 to-orange-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${utilizationRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
          <span>{stats.clockedIn} active</span>
          <span>{stats.total - stats.clockedIn} inactive</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 divide-x divide-neutral-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-neutral-500">Avg Efficiency</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-neutral-900">{stats.avgEfficiency}%</span>
            <TrendingUp className="w-3 h-3 text-green-500" />
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-neutral-500">Hours Today</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">{stats.totalHoursToday}h</span>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-neutral-100 border-t border-neutral-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-neutral-500">In Progress</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">{stats.jobsInProgress}</span>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-xs text-neutral-500">Completed Today</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">{stats.jobsCompletedToday}</span>
        </div>
      </div>
    </div>
  )
}
