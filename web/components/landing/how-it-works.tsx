'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Sign up',
    description: 'Create your account in under a minute. No credit card required.',
  },
  {
    number: '02',
    title: 'Set up shop',
    description: 'Add your services, team, and inventory. Import existing data if needed.',
  },
  {
    number: '03',
    title: 'Start working',
    description: 'Create your first work order and track it through completion.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            Get started in minutes.
          </h2>
          <p className="mt-4 text-xl text-neutral-500">
            No complicated setup. No training required.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="py-10 md:py-0 md:px-10 first:md:pl-0 last:md:pr-0"
            >
              <span className="text-xs font-mono font-semibold text-neutral-400 tracking-widest">
                {step.number}
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
