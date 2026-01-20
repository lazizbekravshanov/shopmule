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
    color: 'from-blue-500 to-cyan-500',
    size: 'large',
  },
  {
    icon: Wrench,
    title: 'Job Management',
    description: 'Drag-and-drop workflow boards with real-time status updates.',
    color: 'from-orange-500 to-amber-500',
    size: 'small',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Clock in/out for technicians with automatic hour calculations.',
    color: 'from-green-500 to-emerald-500',
    size: 'small',
  },
  {
    icon: MessageSquare,
    title: 'Customer Communication',
    description: 'Automated text and email updates. Appointment reminders. Service history access for customers.',
    color: 'from-purple-500 to-pink-500',
    size: 'large',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Real-time parts tracking with low stock alerts.',
    color: 'from-red-500 to-rose-500',
    size: 'small',
  },
  {
    icon: FileText,
    title: 'Invoicing & Payments',
    description: 'Professional invoices in seconds. Online payments.',
    color: 'from-indigo-500 to-violet-500',
    size: 'small',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Revenue dashboards, technician performance metrics, and customer insights. Know your numbers at a glance.',
    color: 'from-teal-500 to-cyan-500',
    size: 'large',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Works on any device. Manage your shop from anywhere.',
    color: 'from-gray-600 to-gray-800',
    size: 'small',
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wider">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to
            <br />
            run a modern shop
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
              className={`group relative bg-white rounded-2xl p-6 overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all cursor-default ${
                feature.size === 'large' ? 'md:col-span-2' : ''
              }`}
            >
              {/* Background Gradient on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <div className="relative h-full flex flex-col">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-grow">
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
