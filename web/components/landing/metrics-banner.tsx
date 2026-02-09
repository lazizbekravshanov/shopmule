'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';

interface Metric {
  value: number;
  suffix: string;
  label: string;
}

const metrics: Metric[] = [
  { value: 527, suffix: '+', label: 'Active Shops' },
  { value: 12.4, suffix: 'M', label: 'Revenue Managed' },
  { value: 58, suffix: 'K', label: 'Work Orders' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formattedValue = value % 1 === 0
    ? Math.floor(displayValue).toLocaleString()
    : displayValue.toFixed(1);

  return (
    <span className="tabular-nums">
      {suffix === 'M' ? '$' : ''}{formattedValue}{suffix}
    </span>
  );
}

export function MetricsBanner() {
  return (
    <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-y border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Live indicator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-green-400 text-sm font-medium">Live Platform Metrics</span>
          </motion.div>

          {/* Metrics */}
          <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center flex-1">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-xl md:text-2xl font-bold text-white">
                  <AnimatedNumber value={metric.value} suffix={metric.suffix} />
                </div>
                <div className="text-xs text-neutral-400">{metric.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Growth indicator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-2 text-orange-400"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+127% YoY Growth</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Floating version that can be placed anywhere
export function MetricsFloating() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3"
    >
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-orange-400" />
        <span className="text-sm text-white/80">Powering</span>
      </div>
      {metrics.slice(0, 3).map((metric, index) => (
        <div key={metric.label} className="flex items-center gap-1">
          <span className="text-white font-semibold">
            {metric.value}{metric.suffix}
          </span>
          <span className="text-white/60 text-sm">{metric.label.toLowerCase()}</span>
          {index < 2 && <span className="text-white/30 mx-2">•</span>}
        </div>
      ))}
    </motion.div>
  );
}
