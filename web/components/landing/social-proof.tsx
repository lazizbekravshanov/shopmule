'use client';

import { motion } from 'framer-motion';
import { Truck, Wrench, Shield, Gauge, Settings } from 'lucide-react';

const logos = [
  { name: 'FleetMax', icon: Truck },
  { name: 'TruckPro', icon: Gauge },
  { name: 'AutoCare', icon: Wrench },
  { name: 'RoadReady', icon: Shield },
  { name: 'MechWorks', icon: Settings },
];

export function SocialProof() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <p className="text-sm text-neutral-400 uppercase tracking-widest">
            Trusted by leading shops
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="flex items-center gap-2 group"
              >
                <logo.icon className="w-5 h-5 text-neutral-300 group-hover:text-amber-500 transition-colors duration-300" />
                <span className="text-lg font-semibold text-neutral-300 group-hover:text-neutral-400 transition-colors duration-300 tracking-tight">
                  {logo.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      {/* Gradient Divider */}
      <div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
    </section>
  );
}
