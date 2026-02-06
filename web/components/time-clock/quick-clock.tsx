'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Square,
  Coffee,
  Clock,
  MapPin,
  Smartphone,
  Laptop,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickClockProps {
  employeeId?: string
  employeeName?: string
  currentStatus: 'clocked_out' | 'clocked_in' | 'on_break'
  clockedInAt?: string
  breakStartedAt?: string
  onClockIn: () => void
  onClockOut: () => void
  onStartBreak: () => void
  onEndBreak: () => void
  isLoading?: boolean
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatElapsed(startTime: string): string {
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function QuickClock({
  employeeId,
  employeeName = 'Select Employee',
  currentStatus,
  clockedInAt,
  breakStartedAt,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  isLoading,
}: QuickClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [elapsed, setElapsed] = useState('00:00:00')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      if (clockedInAt) {
        setElapsed(formatElapsed(clockedInAt))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [clockedInAt])

  const statusConfig = {
    clocked_out: {
      bg: 'bg-neutral-100',
      text: 'text-neutral-600',
      label: 'Not Clocked In',
      accent: 'neutral',
    },
    clocked_in: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'Working',
      accent: 'green',
    },
    on_break: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      label: 'On Break',
      accent: 'amber',
    },
  }

  const config = statusConfig[currentStatus]

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Current Time Display */}
      <div className={cn("px-6 py-8 text-center", config.bg)}>
        <motion.div
          key={currentTime.getTime()}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="text-5xl font-mono font-bold tracking-wider text-neutral-900 mb-2"
        >
          {formatTime(currentTime)}
        </motion.div>
        <p className="text-sm text-neutral-500">
          {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        {/* Status Badge */}
        <div className={cn(
          "inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full",
          config.bg,
          config.text,
          "border",
          currentStatus === 'clocked_in' && "border-green-200",
          currentStatus === 'on_break' && "border-amber-200",
          currentStatus === 'clocked_out' && "border-neutral-200"
        )}>
          {currentStatus === 'clocked_in' && (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          {currentStatus === 'on_break' && (
            <Coffee className="w-4 h-4" />
          )}
          <span className="font-medium">{config.label}</span>
        </div>

        {/* Elapsed Time */}
        {clockedInAt && currentStatus !== 'clocked_out' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-xs text-neutral-500 mb-1">Time on clock</p>
            <p className="text-2xl font-mono font-semibold text-neutral-700">{elapsed}</p>
          </motion.div>
        )}
      </div>

      {/* Employee Info */}
      <div className="px-6 py-4 border-t border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white",
              employeeId
                ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                : "bg-neutral-300"
            )}>
              {employeeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-neutral-900">{employeeName}</p>
              {clockedInAt && (
                <p className="text-xs text-neutral-500">
                  Clocked in at {new Date(clockedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>Shop Floor</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {currentStatus === 'clocked_out' ? (
            <motion.button
              key="clock-in"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={onClockIn}
              disabled={!employeeId || isLoading}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all",
                employeeId
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              )}
            >
              <Play className="w-6 h-6 fill-current" />
              Clock In
            </motion.button>
          ) : currentStatus === 'on_break' ? (
            <motion.button
              key="end-break"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={onEndBreak}
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-white transition-all"
            >
              <Play className="w-6 h-6 fill-current" />
              End Break
            </motion.button>
          ) : (
            <motion.div
              key="clock-out-options"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <button
                onClick={onClockOut}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white transition-all"
              >
                <Square className="w-5 h-5 fill-current" />
                Clock Out
              </button>
              <button
                onClick={onStartBreak}
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all"
              >
                <Coffee className="w-4 h-4" />
                Start Break
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Device Info Footer */}
      <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1">
            <Laptop className="w-3 h-3" />
            <span>Desktop</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Verified Location</span>
          </div>
        </div>
      </div>
    </div>
  )
}
