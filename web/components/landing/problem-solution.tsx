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
    <section className="py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-amber-500" />
            <span className="text-sm font-medium text-amber-600 uppercase tracking-widest">
              The Difference
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
            Stop the chaos.
          </h2>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid gap-px bg-neutral-200">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.before}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white grid md:grid-cols-[1fr,auto,1fr] items-center gap-4 py-5"
            >
              {/* Before */}
              <div className="text-neutral-400 line-through decoration-neutral-300">
                {item.before}
              </div>

              {/* Arrow */}
              <ArrowRight className="w-4 h-4 text-primary-500 hidden md:block" />

              {/* After */}
              <div className="text-neutral-900 font-medium">
                {item.after}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
