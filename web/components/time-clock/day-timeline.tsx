'use client'

import { motion } from 'framer-motion'
import { Clock, Coffee, Wrench, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeBlock {
  id: string
  type: 'work' | 'break' | 'overtime'
  startTime: string
  endTime?: string
  jobId?: string
  jobName?: string
}

interface TechTimeline {
  id: string
  name: string
  blocks: TimeBlock[]
  totalHours: number
  efficiency: number
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 6) // 6 AM to 6 PM

function getBlockPosition(startTime: string, endTime?: string): { left: string; width: string } {
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()

  const startHour = start.getHours() + start.getMinutes() / 60
  const endHour = end.getHours() + end.getMinutes() / 60

  // Timeline starts at 6 AM
  const leftPercent = Math.max(0, ((startHour - 6) / 12) * 100)
  const widthPercent = Math.min(100 - leftPercent, ((endHour - startHour) / 12) * 100)

  return {
    left: `${leftPercent}%`,
    width: `${Math.max(2, widthPercent)}%`,
  }
}

function TimeBlock({ block, index }: { block: TimeBlock; index: number }) {
  const position = getBlockPosition(block.startTime, block.endTime)

  const colors = {
    work: 'bg-gradient-to-r from-blue-500 to-blue-400',
    break: 'bg-gradient-to-r from-amber-500 to-amber-400',
    overtime: 'bg-gradient-to-r from-red-500 to-red-400',
  }

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      style={{ left: position.left, width: position.width }}
      className={cn(
        "absolute top-1 bottom-1 rounded-md origin-left group cursor-pointer",
        colors[block.type],
        !block.endTime && "animate-pulse"
      )}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
          <div className="flex items-center gap-1.5 mb-1">
            {block.type === 'work' && <Wrench className="w-3 h-3" />}
            {block.type === 'break' && <Coffee className="w-3 h-3" />}
            {block.type === 'overtime' && <AlertTriangle className="w-3 h-3" />}
            <span className="font-medium capitalize">{block.type}</span>
          </div>
          {block.jobName && (
            <p className="text-neutral-400 text-[10px] mb-1">{block.jobName}</p>
          )}
          <p className="text-neutral-300">
            {new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' - '}
            {block.endTime
              ? new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Now'
            }
          </p>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
      </div>
    </motion.div>
  )
}

function TechRow({ tech, index }: { tech: TechTimeline; index: number }) {
  const initials = tech.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 py-3"
    >
      {/* Tech Info */}
      <div className="w-40 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-500 flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">{tech.name}</p>
          <p className="text-xs text-neutral-500">{tech.totalHours.toFixed(1)}h</p>
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="flex-1 relative h-8 bg-neutral-100 rounded-lg overflow-hidden">
        {tech.blocks.map((block, i) => (
          <TimeBlock key={block.id} block={block} index={i} />
        ))}
      </div>

      {/* Efficiency */}
      <div className="w-16 text-right flex-shrink-0">
        <span className={cn(
          "text-sm font-semibold",
          tech.efficiency >= 100 ? "text-green-600" :
          tech.efficiency >= 80 ? "text-blue-600" :
          tech.efficiency >= 60 ? "text-amber-600" : "text-red-600"
        )}>
          {tech.efficiency}%
        </span>
      </div>
    </motion.div>
  )
}

export function DayTimeline({ technicians }: { technicians: TechTimeline[] }) {
  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const nowPosition = ((currentHour - 6) / 12) * 100

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Today's Timeline</h3>
            <p className="text-xs text-neutral-500">Visual breakdown of work hours</p>
          </div>
        </div>
      </div>

      {/* Time Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-40 flex-shrink-0" />
          <div className="flex-1 relative">
            <div className="flex justify-between text-xs text-neutral-400">
              {HOURS.map(hour => (
                <span key={hour} className="w-0 text-center">
                  {hour > 12 ? `${hour - 12}p` : hour === 12 ? '12p' : `${hour}a`}
                </span>
              ))}
            </div>
          </div>
          <div className="w-16 flex-shrink-0 text-xs text-neutral-500 text-right">
            Eff.
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="px-5 pb-4">
        <div className="relative">
          {/* Current time indicator */}
          {nowPosition >= 0 && nowPosition <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `calc(10rem + 1rem + ${nowPosition}% * (100% - 10rem - 1rem - 4rem) / 100)` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
            </div>
          )}

          {technicians.map((tech, index) => (
            <TechRow key={tech.id} tech={tech} index={index} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-400" />
            <span className="text-neutral-600">Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-amber-500 to-amber-400" />
            <span className="text-neutral-600">Break</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-red-400" />
            <span className="text-neutral-600">Overtime</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-3 h-0.5 bg-red-500" />
            <span className="text-neutral-600">Current time</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { TechTimeline, TimeBlock }
