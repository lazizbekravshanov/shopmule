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
    description: 'Cascadia needs a turbo rebuild? Create the order, assign your tech, attach photos of the failure, and track it through completion. Customers get text updates automatically.',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Your techs clock into each job — not just the shop. Know exactly how long that injector swap took so you bill for every hour, not just what you remember.',
  },
  {
    icon: FileText,
    title: 'Invoicing & Payments',
    description: 'Job done? Invoice goes out in one click with labor, parts, markup, and tax already calculated. Customers pay online or you record cash at the counter.',
  },
  {
    icon: Package,
    title: 'Parts & Inventory',
    description: 'Track DPF filters, DEF fluid, brake drums — down to the shelf. Get alerts before you run out so you\'re never dead in the water on a Friday rush.',
  },
  {
    icon: BarChart3,
    title: 'Shop Performance',
    description: 'Revenue per tech, average job time, parts margin, outstanding receivables. The numbers you need to run a profitable shop — not vanity metrics.',
  },
  {
    icon: Users,
    title: 'Customer & Fleet Management',
    description: 'Full history for every truck that rolls through your bay. VIN, service records, previous estimates. Fleet accounts with multiple vehicles and contacts.',
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            Built for the shop floor.
            <br />
            <span className="text-neutral-400">Not the boardroom.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-neutral-50 rounded-2xl p-8 group hover:bg-neutral-100/80 transition-colors duration-300"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-neutral-700 shadow-sm">
                <feature.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
