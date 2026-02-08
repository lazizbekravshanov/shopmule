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
    <section id="how-it-works" className="py-24 bg-neutral-50 relative">
      {/* Top gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

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
              Getting Started
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
            Up and running in minutes.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              {/* Step Number */}
              <span className="text-6xl font-bold text-neutral-200">
                {step.number}
              </span>

              {/* Content */}
              <h3 className="mt-4 text-xl font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-neutral-600 leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-neutral-200"
                     style={{ width: 'calc(100% - 3rem)', left: '3rem' }} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
