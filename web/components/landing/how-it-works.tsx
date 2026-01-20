'use client';

import { motion } from 'framer-motion';
import { UserPlus, Upload, Settings, Rocket } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Sign Up',
    description: 'Create your account in 30 seconds. No credit card required for your 14-day trial.',
  },
  {
    icon: Upload,
    number: '02',
    title: 'Import Data',
    description: 'Easily migrate from spreadsheets or your old system. We help you every step of the way.',
  },
  {
    icon: Settings,
    number: '03',
    title: 'Set Up Shop',
    description: 'Add your services, team members, and inventory. Customize workflows to match your process.',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Go Live',
    description: 'Start managing jobs and delighting customers. See results from day one.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wider">How It Works</p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Up and running in minutes,
            <br />
            not months
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We&apos;ve made it ridiculously simple to get started. Most shops are fully operational within a day.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center lg:text-left"
              >
                {/* Step Number */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-black transition-colors">
                    <step.icon className="w-7 h-7 text-gray-900" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
