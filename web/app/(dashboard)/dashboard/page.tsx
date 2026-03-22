'use client';

import { motion } from 'framer-motion';
import {
  AICommandCenter,
  AIInsights,
  ShopPulse,
  LiveBayBoard,
  TodaysSchedule,
  TechnicianStatusBoard,
  RecentActivity,
} from '@/components/dashboard';
import { AIAccuracyWidget } from '@/components/dashboard/ai-accuracy-widget';

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-8">
      {/* Section 1: AI Command Center - The Hero with Urgent Attention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AICommandCenter />
      </motion.div>

      {/* Section 2: AI Insights + Shop Pulse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2">
          <ShopPulse />
        </div>
        <div className="space-y-6">
          <AIInsights />
          <AIAccuracyWidget />
        </div>
      </motion.div>

      {/* Section 3: Three-Column Layout - Schedule, Team Status, Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <TodaysSchedule />
        <TechnicianStatusBoard />
        <RecentActivity />
      </motion.div>

      {/* Section 4: Live Bay Board - Shop Floor Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <LiveBayBoard />
      </motion.div>
    </div>
  );
}
