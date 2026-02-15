'use client';

import { motion } from 'framer-motion';
import { Activity, Clock, Gauge, Timer, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ShopHealthScore } from '@/lib/ai/work-order-ai';

interface ShopHealthScoreWidgetProps {
  health: ShopHealthScore;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#f59e0b' :
    score >= 40 ? '#f97316' :
    '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-neutral-900">{score}</span>
      </div>
    </div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
  unit,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit?: string;
  status: 'good' | 'warning' | 'bad';
}) {
  const statusColor = {
    good: 'text-emerald-600',
    warning: 'text-amber-600',
    bad: 'text-red-600',
  }[status];

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[11px] text-neutral-500 truncate">{label}</div>
        <div className={cn('text-sm font-semibold', statusColor)}>
          {value}{unit && <span className="text-xs font-normal text-neutral-400"> {unit}</span>}
        </div>
      </div>
    </div>
  );
}

export function ShopHealthScoreWidget({ health }: ShopHealthScoreWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-neutral-200 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-[#ee7a14]" />
        <h3 className="text-sm font-semibold text-neutral-900">Shop Health</h3>
      </div>

      <div className="flex items-center gap-5">
        <ScoreRing score={health.overall} />
        <div className="flex-1 space-y-2.5">
          <MiniMetric
            icon={Gauge}
            label="Efficiency"
            value={health.efficiency}
            unit="%"
            status={health.efficiency >= 70 ? 'good' : health.efficiency >= 50 ? 'warning' : 'bad'}
          />
          <MiniMetric
            icon={Clock}
            label="Approval Latency"
            value={health.approvalLatencyHrs}
            unit="hrs"
            status={health.approvalLatencyHrs <= 24 ? 'good' : health.approvalLatencyHrs <= 72 ? 'warning' : 'bad'}
          />
          <MiniMetric
            icon={TrendingUp}
            label="Utilization"
            value={health.utilization}
            unit="%"
            status={health.utilization >= 75 ? 'good' : health.utilization >= 50 ? 'warning' : 'bad'}
          />
          <MiniMetric
            icon={Timer}
            label="Turnaround"
            value={health.avgTurnaroundDays}
            unit="days"
            status={health.avgTurnaroundDays <= 5 ? 'good' : health.avgTurnaroundDays <= 10 ? 'warning' : 'bad'}
          />
        </div>
      </div>
    </motion.div>
  );
}
