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
    <section id="features" className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header - Apple style: centered, large */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            Everything you need.
            <br />
            <span className="text-neutral-400">Nothing you don&apos;t.</span>
          </h2>
        </motion.div>

        {/* Feature Grid - Apple style: clean cards with generous spacing */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-neutral-50 rounded-3xl p-8 group hover:bg-neutral-100/80 transition-all duration-500"
            >
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-neutral-700 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500">
                <feature.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="mt-6 text-xl font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
