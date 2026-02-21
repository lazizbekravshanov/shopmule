'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, Globe, Zap } from 'lucide-react';

const marketStats = [
  {
    value: '$89.6B',
    label: 'Total Addressable Market',
    sublabel: 'US Auto Repair Industry Revenue',
    description: 'The US auto repair industry generates $89.6B annually and continues to grow with increasing vehicle complexity.',
  },
  {
    value: '~$1.5B',
    label: 'Serviceable Market',
    sublabel: 'Shop Management Software',
    description: 'The shop management software market is projected to reach ~$3.2B by 2033, growing at ~9% CAGR.',
  },
  {
    value: '$450M+',
    label: 'Initial Target Market',
    sublabel: 'Independent Repair Shops',
    description: '215,000+ independently owned shops ready for modern software — most still use paper or legacy tools.',
  },
];

const growthDrivers = [
  {
    icon: TrendingUp,
    title: '~9% CAGR',
    description: 'Shop management software market growing steadily through 2033',
  },
  {
    icon: Target,
    title: '54% Underserved',
    description: 'Majority of small/medium service businesses still use paper or spreadsheets',
  },
  {
    icon: Globe,
    title: '303K+ Shops',
    description: '71% independently owned — fragmented market ready for a modern platform',
  },
  {
    icon: Zap,
    title: 'AI Advantage',
    description: 'First-mover in AI-powered estimates, repair notes, and predictive parts needs',
  },
];

export function MarketOpportunity() {
  return (
    <section className="py-24 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium mb-4"
          >
            Market Opportunity
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            A Massive, Underserved Market
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-2xl mx-auto"
          >
            The commercial repair industry is ripe for disruption. Most shops still operate on paper while customers expect digital experiences.
          </motion.p>
        </div>

        {/* TAM/SAM/SOM Visualization */}
        <div className="relative mb-20">
          {/* Concentric circles visualization */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              {/* TAM - Outer circle */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center"
              >
                {/* SAM - Middle circle */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center"
                >
                  {/* SOM - Inner circle */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-orange-500 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold">$450M+</div>
                      <div className="text-xs text-orange-100">SOM</div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Labels */}
              <div className="absolute top-4 right-0 text-right">
                <div className="text-2xl font-bold text-orange-400">$89.6B</div>
                <div className="text-sm text-neutral-500">TAM</div>
              </div>
              <div className="absolute top-24 -right-8 text-right">
                <div className="text-xl font-bold text-orange-300">~$1.5B</div>
                <div className="text-sm text-neutral-500">SAM</div>
              </div>
            </div>
          </div>

          {/* Market Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {marketStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              >
                <div className="text-3xl font-bold text-orange-400 mb-1">{stat.value}</div>
                <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                <div className="text-sm text-orange-300/80 mb-3">{stat.sublabel}</div>
                <p className="text-sm text-neutral-400">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Growth Drivers */}
        <div className="grid md:grid-cols-4 gap-6">
          {growthDrivers.map((driver, index) => (
            <motion.div
              key={driver.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <driver.icon className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-xl font-bold text-white mb-2">{driver.title}</div>
              <p className="text-sm text-neutral-400">{driver.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Source attribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-xs text-neutral-600">
            Sources: IBISWorld US Auto Mechanics Industry Report (2025–2026), IoT Analytics (2025), Allied Market Research
          </p>
        </motion.div>
      </div>
    </section>
  );
}
