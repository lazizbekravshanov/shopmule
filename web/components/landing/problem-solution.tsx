'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const comparisons = [
  {
    before: 'Handwritten repair tickets that get lost',
    after: 'Digital work orders tracked from intake to invoice',
  },
  {
    before: 'Calling customers for approval on a $3K brake job',
    after: 'Text-to-approve estimates with photo documentation',
  },
  {
    before: 'End-of-month scramble to figure out who owes what',
    after: 'Invoices generated the second a job closes',
  },
  {
    before: '"We\'re out of that filter" on a Friday afternoon',
    after: 'Auto reorder alerts before stock hits zero',
  },
  {
    before: 'Tech says 4 hours, you billed for 2',
    after: 'Per-job time clock — bill every minute you earned',
  },
];

export function ProblemSolution() {
  return (
    <section className="py-32 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            You know the problems.
            <br />
            <span className="text-neutral-400">We built the fix.</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.before}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="bg-neutral-50 rounded-2xl p-5 md:p-6 grid md:grid-cols-[1fr,auto,1fr] items-center gap-4 md:gap-6"
            >
              <div className="text-neutral-400 line-through decoration-neutral-300 text-base text-center md:text-right leading-snug">
                {item.before}
              </div>

              <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-neutral-200">
                <ArrowRight className="w-4 h-4 text-neutral-500" />
              </div>

              <div className="text-neutral-900 font-medium text-base text-center md:text-left leading-snug">
                {item.after}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
