'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Clock,
  Wrench,
  Star,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  MoreHorizontal,
  Play,
  Award,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Certification {
  name: string
  level: 'basic' | 'advanced' | 'expert'
}

interface TechnicianData {
  id: string
  name: string
  role: string
  avatar?: string
  status: 'clocked_in' | 'clocked_out' | 'on_break'
  clockedInAt?: string
  currentJob?: {
    id: string
    vehicle: string
    description: string
    progress: number
  }
  efficiency: number
  efficiencyTrend: 'up' | 'down' | 'stable'
  todayHours: number
  weekHours: number
  jobsCompleted: number
  certifications: Certification[]
  payRate: number
  email?: string
  phone?: string
}

const certColors = {
  basic: 'bg-blue-100 text-blue-700 border-blue-200',
  advanced: 'bg-purple-100 text-purple-700 border-purple-200',
  expert: 'bg-amber-100 text-amber-700 border-amber-200',
}

function EfficiencyGauge({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const radius = size === 'sm' ? 16 : 24
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const getColor = () => {
    if (value >= 100) return 'text-green-500'
    if (value >= 80) return 'text-blue-500'
    if (value >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className={cn("-rotate-90", size === 'sm' ? "w-10 h-10" : "w-14 h-14")}>
        <circle
          cx={size === 'sm' ? 20 : 28}
          cy={size === 'sm' ? 20 : 28}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={size === 'sm' ? 3 : 4}
        />
        <motion.circle
          cx={size === 'sm' ? 20 : 28}
          cy={size === 'sm' ? 20 : 28}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={size === 'sm' ? 3 : 4}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={getColor()}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn(
        "absolute font-bold",
        getColor(),
        size === 'sm' ? "text-[10px]" : "text-xs"
      )}>
        {value}%
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: TechnicianData['status'] }) {
  const config = {
    clocked_in: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'Working',
      pulse: true,
    },
    clocked_out: {
      bg: 'bg-neutral-50',
      border: 'border-neutral-200',
      text: 'text-neutral-500',
      dot: 'bg-neutral-400',
      label: 'Off',
      pulse: false,
    },
    on_break: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Break',
      pulse: true,
    },
  }

  const c = config[status]

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border',
      c.bg, c.border, c.text
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot, c.pulse && 'animate-pulse')} />
      {c.label}
    </span>
  )
}

export function TechnicianCard({ tech, index }: { tech: TechnicianData; index: number }) {
  const router = useRouter()

  const initials = tech.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/technicians/${tech.id}`)}
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm",
              tech.status === 'clocked_in'
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 ring-2 ring-green-200'
                : tech.status === 'on_break'
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 ring-2 ring-amber-200'
                : 'bg-gradient-to-br from-neutral-400 to-neutral-500'
            )}>
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{tech.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-neutral-500">{tech.role.replace('_', ' ')}</span>
                <StatusBadge status={tech.status} />
              </div>
            </div>
          </div>
          <EfficiencyGauge value={tech.efficiency} size="sm" />
        </div>
      </div>

      {/* Current Job (if working) */}
      {tech.status === 'clocked_in' && tech.currentJob && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2 text-xs text-blue-700 mb-2">
            <Wrench className="w-3 h-3" />
            <span className="font-medium">Current Job</span>
          </div>
          <p className="text-sm font-medium text-neutral-900 truncate">
            {tech.currentJob.vehicle}
          </p>
          <p className="text-xs text-neutral-500 truncate mt-0.5">
            {tech.currentJob.description}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-500">Progress</span>
              <span className="font-medium text-blue-700">{tech.currentJob.progress}%</span>
            </div>
            <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${tech.currentJob.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100">
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-neutral-500">Today</p>
          <p className="text-lg font-semibold text-neutral-900">{tech.todayHours}h</p>
        </div>
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-neutral-500">This Week</p>
          <p className="text-lg font-semibold text-neutral-900">{tech.weekHours}h</p>
        </div>
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-neutral-500">Jobs Done</p>
          <p className="text-lg font-semibold text-neutral-900">{tech.jobsCompleted}</p>
        </div>
      </div>

      {/* Efficiency & Trend */}
      <div className="px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-neutral-700">Efficiency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-semibold",
              tech.efficiency >= 100 ? 'text-green-600' :
              tech.efficiency >= 80 ? 'text-blue-600' :
              tech.efficiency >= 60 ? 'text-amber-600' : 'text-red-600'
            )}>
              {tech.efficiency}%
            </span>
            {tech.efficiencyTrend === 'up' && (
              <span className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +5%
              </span>
            )}
            {tech.efficiencyTrend === 'down' && (
              <span className="flex items-center text-xs text-red-600">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                -3%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Certifications */}
      {tech.certifications.length > 0 && (
        <div className="px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-neutral-700">Certifications</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tech.certifications.slice(0, 3).map((cert, i) => (
              <span
                key={i}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-medium rounded-full border',
                  certColors[cert.level]
                )}
              >
                {cert.name}
              </span>
            ))}
            {tech.certifications.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-medium text-neutral-500 bg-neutral-100 rounded-full">
                +{tech.certifications.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {tech.phone && (
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          )}
          {tech.email && (
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <Mail className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">${tech.payRate}/hr</span>
          <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Grid view wrapper
export function TechnicianGrid({ technicians }: { technicians: TechnicianData[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {technicians.map((tech, index) => (
        <TechnicianCard key={tech.id} tech={tech} index={index} />
      ))}
    </div>
  )
}

export type { TechnicianData, Certification }
