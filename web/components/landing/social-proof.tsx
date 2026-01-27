'use client';

import { motion } from 'framer-motion';

const logos = [
  'FleetMax',
  'TruckPro',
  'AutoCare',
  'RoadReady',
  'MechWorks',
];

export function SocialProof() {
  return (
    <section className="py-16 bg-white border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <p className="text-sm text-neutral-400 uppercase tracking-wide shrink-0">
            Trusted by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((logo, index) => (
              <motion.span
                key={logo}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="text-lg font-medium text-neutral-300"
              >
                {logo}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
