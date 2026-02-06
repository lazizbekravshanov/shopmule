'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Play,
  Pause,
  Coffee,
  Timer,
  AlertTriangle,
  ChevronRight,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActiveTech {
  id: string
  name: string
  clockedInAt: string
  status: 'working' | 'on_break'
  breakStartedAt?: string
  currentJob?: {
    id: string
    vehicle: string
    description: string
  }
  totalHoursToday: number
  isOvertime: boolean
}

function formatElapsedTime(startTime: string): string {
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

function LiveTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState(formatElapsedTime(startTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(startTime))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [startTime])

  return <span>{elapsed}</span>
}

function TechRow({ tech, index }: { tech: ActiveTech; index: number }) {
  const initials = tech.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-4 px-4 py-3 hover:bg-neutral-50 transition-colors group",
        tech.isOvertime && "bg-red-50 hover:bg-red-100"
      )}
    >
      {/* Avatar with status indicator */}
      <div className="relative">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm",
          tech.status === 'working'
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-amber-500 to-orange-500'
        )}>
          {initials}
        </div>
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center",
          tech.status === 'working' ? 'bg-green-500' : 'bg-amber-500'
        )}>
          {tech.status === 'working' ? (
            <Play className="w-2 h-2 text-white fill-white" />
          ) : (
            <Pause className="w-2 h-2 text-white" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-900">{tech.name}</span>
          {tech.isOvertime && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
              OT
            </span>
          )}
          {tech.status === 'on_break' && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded flex items-center gap-1">
              <Coffee className="w-2.5 h-2.5" />
              Break
            </span>
          )}
        </div>
        {tech.currentJob ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Wrench className="w-3 h-3 text-neutral-400" />
            <span className="text-xs text-neutral-500 truncate">
              {tech.currentJob.vehicle} - {tech.currentJob.description}
            </span>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">No active job</span>
        )}
      </div>

      {/* Time Info */}
      <div className="text-right">
        <div className="flex items-center gap-1 text-sm font-medium text-neutral-900">
          <Timer className="w-3.5 h-3.5 text-neutral-400" />
          <LiveTimer startTime={tech.clockedInAt} />
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          {tech.totalHoursToday.toFixed(1)}h today
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
    </motion.div>
  )
}

export function LiveStatusBoard({ activeTechs }: { activeTechs: ActiveTech[] }) {
  const workingCount = activeTechs.filter(t => t.status === 'working').length
  const onBreakCount = activeTechs.filter(t => t.status === 'on_break').length
  const overtimeCount = activeTechs.filter(t => t.isOvertime).length

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Live Status</h3>
              <p className="text-xs text-neutral-500">Who's on the clock right now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-lg">
              {workingCount} working
            </span>
            {onBreakCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg">
                {onBreakCount} on break
              </span>
            )}
            {overtimeCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {overtimeCount} OT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-neutral-100 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {activeTechs.length > 0 ? (
            activeTechs.map((tech, index) => (
              <TechRow key={tech.id} tech={tech} index={index} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-12 text-center"
            >
              <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No one is clocked in</p>
              <p className="text-xs text-neutral-400 mt-1">
                Technicians will appear here when they clock in
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {activeTechs.length > 0 && (
        <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">
              Total hours today: <span className="font-medium text-neutral-700">
                {activeTechs.reduce((sum, t) => sum + t.totalHoursToday, 0).toFixed(1)}h
              </span>
            </span>
            <span className="text-neutral-500">
              Last updated: <span className="font-medium text-neutral-700">Just now</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export type { ActiveTech }
