'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Repair Shops' },
  { value: '50K+', label: 'Jobs Completed' },
  { value: '4.9', label: 'Star Rating', icon: Star },
  { value: '99.9%', label: 'Uptime' },
];

const logos = [
  'FleetMax',
  'TruckPro',
  'AutoCare',
  'RoadReady',
  'MechWorks',
  'FixItFast',
];

export function SocialProof() {
  return (
    <section className="relative py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
                  {stat.value}
                </span>
                {stat.icon && <Star className="w-5 h-5 text-warning-500 fill-warning-500" />}
              </div>
              <p className="text-sm text-neutral-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs text-neutral-400 mb-8 uppercase tracking-widest font-medium">
            Trusted by leading repair shops
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((logo, index) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="text-xl md:text-2xl font-semibold text-neutral-300 hover:text-neutral-400 transition-colors duration-200 cursor-default"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
