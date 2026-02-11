'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, Globe, Zap } from 'lucide-react';

const marketStats = [
  {
    value: '$52B',
    label: 'Total Addressable Market',
    sublabel: 'US Commercial Repair Industry',
    description: 'The repair industry continues to grow with increasing vehicle complexity.',
  },
  {
    value: '$8.2B',
    label: 'Serviceable Market',
    sublabel: 'Shop Management Software',
    description: 'Only 12% of shops use modern software. Massive opportunity for disruption.',
  },
  {
    value: '$850M',
    label: 'Initial Target Market',
    sublabel: 'Independent Repair Shops',
    description: '150,000+ independent shops ready for digital transformation.',
  },
];

const growthDrivers = [
  {
    icon: TrendingUp,
    title: '15% CAGR',
    description: 'Industry growing steadily as vehicle technology advances',
  },
  {
    icon: Target,
    title: '88% Underserved',
    description: 'Most shops still use paper or outdated software',
  },
  {
    icon: Globe,
    title: 'Global Expansion',
    description: 'International markets represent 3x domestic opportunity',
  },
  {
    icon: Zap,
    title: 'AI Advantage',
    description: 'First-mover in AI-powered shop management',
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
                      <div className="text-2xl md:text-3xl font-bold">$850M</div>
                      <div className="text-xs text-orange-100">SOM</div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Labels */}
              <div className="absolute top-4 right-0 text-right">
                <div className="text-2xl font-bold text-orange-400">$52B</div>
                <div className="text-sm text-neutral-500">TAM</div>
              </div>
              <div className="absolute top-24 -right-8 text-right">
                <div className="text-xl font-bold text-orange-300">$8.2B</div>
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

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-neutral-400 italic max-w-2xl mx-auto">
            &ldquo;The collision repair industry is undergoing a digital transformation.
            Companies that provide modern, integrated software solutions are positioned
            to capture significant market share.&rdquo;
          </p>
          <p className="text-sm text-neutral-500 mt-2">— IBISWorld Industry Report, 2024</p>
        </motion.div>
      </div>
    </section>
  );
}
