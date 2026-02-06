'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DayEntry {
  date: string
  dayName: string
  clockIn?: string
  clockOut?: string
  breakMinutes: number
  totalHours: number
  status: 'complete' | 'incomplete' | 'absent' | 'future'
  isToday: boolean
  overtime?: number
}

interface WeekData {
  weekStart: string
  weekEnd: string
  days: DayEntry[]
  totalHours: number
  totalOvertime: number
  avgEfficiency: number
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function DayCell({ day, index }: { day: DayEntry; index: number }) {
  const statusConfig = {
    complete: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    },
    incomplete: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    },
    absent: {
      bg: 'bg-neutral-50',
      border: 'border-neutral-200',
      icon: null,
    },
    future: {
      bg: 'bg-neutral-50',
      border: 'border-neutral-100',
      icon: null,
    },
  }

  const config = statusConfig[day.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-xl border p-4 transition-all",
        config.bg,
        config.border,
        day.isToday && "ring-2 ring-blue-500 ring-offset-2",
        day.status !== 'future' && "hover:shadow-sm cursor-pointer"
      )}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={cn(
            "text-sm font-semibold",
            day.isToday ? "text-blue-600" : "text-neutral-900"
          )}>
            {day.dayName}
          </p>
          <p className="text-xs text-neutral-500">{day.date}</p>
        </div>
        {config.icon}
      </div>

      {/* Times */}
      {day.status !== 'absent' && day.status !== 'future' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">In</span>
            <span className="font-medium text-neutral-700">
              {day.clockIn || '--:--'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Out</span>
            <span className="font-medium text-neutral-700">
              {day.clockOut || '--:--'}
            </span>
          </div>
          {day.breakMinutes > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Break</span>
              <span className="font-medium text-neutral-700">
                {day.breakMinutes}m
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Total</span>
              <span className={cn(
                "text-sm font-bold",
                day.overtime && day.overtime > 0 ? "text-red-600" : "text-neutral-900"
              )}>
                {day.totalHours.toFixed(1)}h
              </span>
            </div>
            {day.overtime && day.overtime > 0 && (
              <div className="flex items-center justify-end gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-medium text-red-600">
                  +{day.overtime.toFixed(1)}h OT
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-[88px] flex items-center justify-center">
          <span className="text-xs text-neutral-400">
            {day.status === 'future' ? 'Upcoming' : 'No entry'}
          </span>
        </div>
      )}
    </motion.div>
  )
}

export function WeeklyTimesheet({ week, employeeName }: { week: WeekData; employeeName: string }) {
  const [weekOffset, setWeekOffset] = useState(0)

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Weekly Timesheet</h3>
              <p className="text-xs text-neutral-500">{employeeName}</p>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-neutral-700 min-w-[140px] text-center">
              {week.weekStart} - {week.weekEnd}
            </span>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={weekOffset >= 0}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="p-5">
        <div className="grid grid-cols-7 gap-3">
          {week.days.map((day, index) => (
            <DayCell key={day.date} day={day} index={index} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-neutral-500">Total Hours</p>
              <p className="text-lg font-bold text-neutral-900">{week.totalHours.toFixed(1)}h</p>
            </div>
            {week.totalOvertime > 0 && (
              <div>
                <p className="text-xs text-red-500">Overtime</p>
                <p className="text-lg font-bold text-red-600">+{week.totalOvertime.toFixed(1)}h</p>
              </div>
            )}
            <div>
              <p className="text-xs text-neutral-500">Avg Efficiency</p>
              <p className={cn(
                "text-lg font-bold",
                week.avgEfficiency >= 100 ? "text-green-600" :
                week.avgEfficiency >= 80 ? "text-blue-600" : "text-amber-600"
              )}>
                {week.avgEfficiency}%
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit Entries
          </button>
        </div>
      </div>
    </div>
  )
}

export type { WeekData, DayEntry }
