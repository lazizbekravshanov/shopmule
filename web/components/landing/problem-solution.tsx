'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const comparisons = [
  { before: 'Paper job tickets', after: 'Digital work orders' },
  { before: 'Lost customer info', after: 'Complete history' },
  { before: 'Manual invoicing', after: 'One-click billing' },
  { before: 'Inventory guesswork', after: 'Real-time tracking' },
  { before: 'Missed follow-ups', after: 'Automated reminders' },
];

export function ProblemSolution() {
  return (
    <section className="py-32 bg-white relative">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header - Apple style: centered, impactful */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            From chaos to clarity.
          </h2>
        </motion.div>

        {/* Comparison Grid - Apple style: clean, spacious */}
        <div className="space-y-4">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.before}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-neutral-50 rounded-2xl p-6 grid md:grid-cols-[1fr,auto,1fr] items-center gap-6"
            >
              {/* Before */}
              <div className="text-neutral-400 line-through decoration-neutral-300 text-lg text-center md:text-right">
                {item.before}
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                <ArrowRight className="w-5 h-5 text-orange-600" />
              </div>

              {/* After */}
              <div className="text-neutral-900 font-medium text-lg text-center md:text-left">
                {item.after}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
