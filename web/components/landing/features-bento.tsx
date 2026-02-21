'use client';

import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Clock,
  FileText,
  Package,
  Sparkles,
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
    icon: Sparkles,
    title: 'AI-Powered Estimates',
    description: 'Upload photos of the damage and get AI-generated repair estimates in seconds. Auto-generated repair notes, predicted parts needs, and smart labor time suggestions.',
  },
  {
    icon: Users,
    title: 'Customer & Fleet Management',
    description: 'Full history for every truck that rolls through your bay. VIN, service records, previous estimates. Fleet accounts with multiple vehicles and contacts.',
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-32 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
            Built for the shop floor.
            <br />
            <span className="text-neutral-500">Not the boardroom.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="bg-neutral-950 p-8 group hover:bg-neutral-900 transition-colors duration-200"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-900 group-hover:bg-neutral-800 transition-colors border border-neutral-800">
                <feature.icon className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
              </div>

              <h3 className="mt-5 text-base font-semibold text-white">
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
