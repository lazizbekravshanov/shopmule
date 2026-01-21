'use client';

import { motion } from 'framer-motion';
import {
  Wrench,
  Camera,
  Clock,
  FileText,
  Package,
  BarChart3,
  MessageSquare,
  Smartphone,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Digital Vehicle Inspections',
    description: 'Take photos, record videos, create detailed inspection reports. Send directly to customers via text or email.',
    iconColor: 'text-primary-600',
    bgColor: 'bg-primary-50',
    hoverBg: 'from-primary-600 to-primary-500',
    size: 'large',
  },
  {
    icon: Wrench,
    title: 'Job Management',
    description: 'Drag-and-drop workflow boards with real-time status updates.',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    hoverBg: 'from-amber-500 to-amber-400',
    size: 'small',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Clock in/out for technicians with automatic hour calculations.',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    hoverBg: 'from-emerald-500 to-emerald-400',
    size: 'small',
  },
  {
    icon: MessageSquare,
    title: 'Customer Communication',
    description: 'Automated text and email updates. Appointment reminders. Service history access for customers.',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverBg: 'from-purple-600 to-purple-500',
    size: 'large',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Real-time parts tracking with low stock alerts.',
    iconColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
    hoverBg: 'from-rose-500 to-rose-400',
    size: 'small',
  },
  {
    icon: FileText,
    title: 'Invoicing & Payments',
    description: 'Professional invoices in seconds. Online payments.',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverBg: 'from-indigo-600 to-indigo-500',
    size: 'small',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Revenue dashboards, technician performance metrics, and customer insights. Know your numbers at a glance.',
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50',
    hoverBg: 'from-teal-600 to-teal-500',
    size: 'large',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Works on any device. Manage your shop from anywhere.',
    iconColor: 'text-neutral-700',
    bgColor: 'bg-neutral-100',
    hoverBg: 'from-neutral-700 to-neutral-600',
    size: 'small',
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary-600 mb-3 uppercase tracking-widest">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Everything you need to
            <br />
            run a modern shop
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Powerful tools that work together seamlessly. No more juggling multiple apps.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`group relative bg-white rounded-2xl p-6 overflow-hidden border border-neutral-200/60 hover:border-primary-200 hover:shadow-premium-lg transition-all duration-300 cursor-default ${
                feature.size === 'large' ? 'md:col-span-2' : ''
              }`}
            >
              {/* Background Gradient on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.hoverBg} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`}
              />

              <div className="relative h-full flex flex-col">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
