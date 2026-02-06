'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Wrench,
  ChevronDown,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TechRanking {
  id: string
  name: string
  avatar?: string
  rank: number
  previousRank: number
  efficiency: number
  billedHours: number
  revenue: number
  jobsCompleted: number
  comebackRate: number
  score: number
}

type SortBy = 'score' | 'efficiency' | 'revenue' | 'jobs'

const sortOptions: { label: string; value: SortBy }[] = [
  { label: 'Overall Score', value: 'score' },
  { label: 'Efficiency', value: 'efficiency' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Jobs Completed', value: 'jobs' },
]

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-amber-500" />
    case 2:
      return <Medal className="w-5 h-5 text-neutral-400" />
    case 3:
      return <Medal className="w-5 h-5 text-amber-700" />
    default:
      return <span className="text-sm font-bold text-neutral-400">#{rank}</span>
  }
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-amber-400 to-yellow-500 ring-2 ring-amber-200'
    case 2:
      return 'bg-gradient-to-br from-neutral-300 to-neutral-400 ring-2 ring-neutral-200'
    case 3:
      return 'bg-gradient-to-br from-amber-600 to-amber-700 ring-2 ring-amber-300'
    default:
      return 'bg-gradient-to-br from-neutral-400 to-neutral-500'
  }
}

function TechRow({ tech, index }: { tech: TechRanking; index: number }) {
  const rankChange = tech.previousRank - tech.rank
  const initials = tech.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors",
        tech.rank <= 3 && "bg-gradient-to-r from-amber-50/50 to-transparent"
      )}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center">
        {getRankIcon(tech.rank)}
      </div>

      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm",
        getRankBadge(tech.rank)
      )}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-900">{tech.name}</span>
          {tech.rank === 1 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">
              TOP PERFORMER
            </span>
          )}
          {rankChange > 0 && (
            <span className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +{rankChange}
            </span>
          )}
          {rankChange < 0 && (
            <span className="flex items-center text-xs text-red-600">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              {rankChange}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tech.billedHours}h billed
          </span>
          <span className="flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            {tech.jobsCompleted} jobs
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-neutral-500">Efficiency</p>
          <p className={cn(
            "text-sm font-bold",
            tech.efficiency >= 100 ? "text-green-600" :
            tech.efficiency >= 80 ? "text-blue-600" : "text-amber-600"
          )}>
            {tech.efficiency}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-500">Revenue</p>
          <p className="text-sm font-bold text-neutral-900">
            ${(tech.revenue / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="text-center w-20">
          <p className="text-xs text-neutral-500">Score</p>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-neutral-900">{tech.score}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function TechLeaderboard({ rankings }: { rankings: TechRanking[] }) {
  const [sortBy, setSortBy] = useState<SortBy>('score')
  const [showDropdown, setShowDropdown] = useState(false)

  const sortedRankings = [...rankings].sort((a, b) => {
    switch (sortBy) {
      case 'efficiency':
        return b.efficiency - a.efficiency
      case 'revenue':
        return b.revenue - a.revenue
      case 'jobs':
        return b.jobsCompleted - a.jobsCompleted
      default:
        return b.score - a.score
    }
  })

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Technician Leaderboard</h3>
              <p className="text-xs text-neutral-500">This month's performance rankings</p>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Sort by: {sortOptions.find(o => o.value === sortBy)?.label}
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showDropdown && "rotate-180"
              )} />
            </button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-10"
              >
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setShowDropdown(false)
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 transition-colors first:rounded-t-lg last:rounded-b-lg",
                      sortBy === option.value && "bg-neutral-50 font-medium"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="divide-y divide-neutral-100">
        {sortedRankings.map((tech, index) => (
          <TechRow key={tech.id} tech={{ ...tech, rank: index + 1 }} index={index} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            Score = (Efficiency × 0.4) + (Revenue × 0.3) + (Jobs × 0.2) + (Satisfaction × 0.1)
          </span>
          <span>Updated daily</span>
        </div>
      </div>
    </div>
  )
}

// Sample data
export function getSampleTechRankings(): TechRanking[] {
  return [
    {
      id: '1',
      name: 'Mike Johnson',
      rank: 1,
      previousRank: 2,
      efficiency: 112,
      billedHours: 168,
      revenue: 24500,
      jobsCompleted: 28,
      comebackRate: 1.2,
      score: 94,
    },
    {
      id: '2',
      name: 'Sarah Chen',
      rank: 2,
      previousRank: 1,
      efficiency: 105,
      billedHours: 156,
      revenue: 22800,
      jobsCompleted: 25,
      comebackRate: 0.8,
      score: 91,
    },
    {
      id: '3',
      name: 'Carlos Rodriguez',
      rank: 3,
      previousRank: 3,
      efficiency: 98,
      billedHours: 144,
      revenue: 19200,
      jobsCompleted: 22,
      comebackRate: 2.1,
      score: 85,
    },
    {
      id: '4',
      name: 'James Wilson',
      rank: 4,
      previousRank: 5,
      efficiency: 92,
      billedHours: 136,
      revenue: 17600,
      jobsCompleted: 20,
      comebackRate: 1.5,
      score: 79,
    },
    {
      id: '5',
      name: 'Tom Anderson',
      rank: 5,
      previousRank: 4,
      efficiency: 88,
      billedHours: 128,
      revenue: 15400,
      jobsCompleted: 18,
      comebackRate: 2.8,
      score: 72,
    },
  ]
}

export type { TechRanking, SortBy }
