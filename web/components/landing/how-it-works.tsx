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
    <section id="how-it-works" className="py-32 bg-neutral-50 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header - Apple style: centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            Get started in minutes.
          </h2>
          <p className="mt-6 text-xl text-neutral-500 max-w-2xl mx-auto">
            No complicated setup. No training required.
          </p>
        </motion.div>

        {/* Steps - Apple style: clean, spacious cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Step Number - Large, gradient */}
              <span className="inline-block text-8xl font-bold bg-gradient-to-b from-neutral-200 to-neutral-100 bg-clip-text text-transparent">
                {step.number}
              </span>

              {/* Content */}
              <h3 className="mt-2 text-2xl font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-4 text-neutral-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
