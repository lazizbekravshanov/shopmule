'use client';

import { motion } from 'framer-motion';
import {
  AICommandCenter,
  ShopPulse,
  LiveBayBoard,
  TodaysSchedule,
  TechnicianStatusBoard,
} from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-8">
      {/* Section 1: AI Command Center - The Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AICommandCenter />
      </motion.div>

      {/* Section 2: Shop Pulse - Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ShopPulse />
      </motion.div>

      {/* Section 3: Today's Focus - Schedule + Team Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <TodaysSchedule />
        <TechnicianStatusBoard />
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
