'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeatmapCell {
  day: string
  hour: number
  value: number // 0-100 utilization percentage
  techCount?: number
}

interface HeatmapData {
  cells: HeatmapCell[]
  avgUtilization: number
  peakHour: string
  peakDay: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 6) // 6 AM to 5 PM

function getColor(value: number): string {
  if (value >= 90) return 'bg-green-600'
  if (value >= 75) return 'bg-green-500'
  if (value >= 60) return 'bg-green-400'
  if (value >= 45) return 'bg-amber-400'
  if (value >= 30) return 'bg-amber-300'
  if (value >= 15) return 'bg-amber-200'
  return 'bg-neutral-200'
}

function HeatmapGrid({ data }: { data: HeatmapData }) {
  // Create a map for quick lookup
  const cellMap = new Map<string, HeatmapCell>()
  data.cells.forEach(cell => {
    cellMap.set(`${cell.day}-${cell.hour}`, cell)
  })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour Headers */}
        <div className="flex items-center gap-1 mb-2 ml-12">
          {HOURS.map(hour => (
            <div
              key={hour}
              className="flex-1 text-center text-[10px] text-neutral-500"
            >
              {hour > 12 ? `${hour - 12}p` : hour === 12 ? '12p' : `${hour}a`}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        <div className="space-y-1">
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1">
              <div className="w-10 text-xs text-neutral-500 text-right pr-2">
                {day}
              </div>
              {HOURS.map((hour, hourIndex) => {
                const cell = cellMap.get(`${day}-${hour}`)
                const value = cell?.value ?? 0

                return (
                  <motion.div
                    key={`${day}-${hour}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (dayIndex * HOURS.length + hourIndex) * 0.005 }}
                    className={cn(
                      "flex-1 h-8 rounded-sm cursor-pointer group relative",
                      getColor(value)
                    )}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        <p className="font-medium">{day} {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}</p>
                        <p className="text-neutral-400">
                          {value}% utilized
                          {cell?.techCount && ` • ${cell.techCount} techs`}
                        </p>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function UtilizationHeatmap({ data }: { data: HeatmapData }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Labor Utilization</h3>
              <p className="text-xs text-neutral-500">Weekly capacity by hour</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-neutral-500">Avg Utilization</p>
              <p className={cn(
                "text-lg font-bold",
                data.avgUtilization >= 75 ? "text-green-600" :
                data.avgUtilization >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {data.avgUtilization}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="p-5">
        <HeatmapGrid data={data} />
      </div>

      {/* Legend & Insights */}
      <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          {/* Color Legend */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-500 mr-2">Utilization:</span>
            <div className="flex items-center gap-0.5">
              <div className="w-4 h-4 rounded-sm bg-neutral-200" title="0-15%" />
              <div className="w-4 h-4 rounded-sm bg-amber-200" title="15-30%" />
              <div className="w-4 h-4 rounded-sm bg-amber-300" title="30-45%" />
              <div className="w-4 h-4 rounded-sm bg-amber-400" title="45-60%" />
              <div className="w-4 h-4 rounded-sm bg-green-400" title="60-75%" />
              <div className="w-4 h-4 rounded-sm bg-green-500" title="75-90%" />
              <div className="w-4 h-4 rounded-sm bg-green-600" title="90-100%" />
            </div>
            <span className="text-xs text-neutral-500 ml-2">Low → High</span>
          </div>

          {/* Peak Info */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-neutral-600">
                Peak: <span className="font-medium text-neutral-900">{data.peakDay} {data.peakHour}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper to generate sample data
export function generateSampleHeatmapData(): HeatmapData {
  const cells: HeatmapCell[] = []

  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      // Simulate realistic patterns
      let baseValue = 50

      // Higher on weekdays
      if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day)) {
        baseValue += 20
      }

      // Peak hours 9-11 AM and 1-3 PM
      if (hour >= 9 && hour <= 11) baseValue += 25
      if (hour >= 13 && hour <= 15) baseValue += 20

      // Lower early morning and late afternoon
      if (hour < 8) baseValue -= 30
      if (hour > 16) baseValue -= 20

      // Add some randomness
      const value = Math.min(100, Math.max(0, baseValue + Math.floor(Math.random() * 20) - 10))

      cells.push({
        day,
        hour,
        value,
        techCount: Math.floor(value / 20) + 1,
      })
    })
  })

  return {
    cells,
    avgUtilization: 72,
    peakHour: '10:00 AM',
    peakDay: 'Tuesday',
  }
}

export type { HeatmapData, HeatmapCell }
