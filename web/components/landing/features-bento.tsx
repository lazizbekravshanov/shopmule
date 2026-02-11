'use client';

import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Clock,
  FileText,
  Package,
  BarChart3,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: ClipboardCheck,
    title: 'Work Orders',
    description: 'Create, assign, and track repair jobs from intake to completion. Real-time status updates keep everyone in sync.',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Clock in/out for each job. Automatic hour calculations for accurate labor billing.',
  },
  {
    icon: FileText,
    title: 'Invoicing',
    description: 'Generate professional invoices in seconds. Accept payments online or in-shop.',
  },
  {
    icon: Package,
    title: 'Inventory',
    description: 'Track parts and supplies. Low stock alerts ensure you never miss a sale.',
  },
  {
    icon: BarChart3,
    title: 'Reports',
    description: 'Revenue, labor hours, technician performance. Know your numbers at a glance.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Assign jobs, track availability, manage schedules. Keep your crew coordinated.',
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-24 bg-white">
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
            <div className="h-px w-8 bg-neutral-300" />
            <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
              Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
            Built for repair shops.
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl">
            The tools you need to run efficiently. Nothing more, nothing less.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 rounded-2xl overflow-hidden">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white p-8 group hover:bg-neutral-50 transition-colors duration-300"
            >
              {/* Icon */}
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 group-hover:text-neutral-800 transition-all duration-300">
                <feature.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="mt-5 text-lg font-semibold text-neutral-900 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="mt-2 text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
