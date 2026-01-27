'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "We went from chaos to organized in a week. The time tracking alone saved us thousands in lost billable hours.",
    author: "Mike Rodriguez",
    role: "Owner, Rodriguez Truck Repair",
  },
  {
    quote: "Finally, software that understands repair shops. My technicians picked it up in minutes, not days.",
    author: "James Williams",
    role: "Owner, Williams Auto & Diesel",
  },
  {
    quote: "The simplicity is what sold us. No bloat, just the tools we actually need to run our shop.",
    author: "Sarah Chen",
    role: "Service Manager, FleetMax",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
            Testimonials
          </span>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
            Trusted by shops.
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.blockquote
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              {/* Quote Mark */}
              <span className="absolute -top-4 -left-2 text-6xl text-neutral-200 font-serif leading-none">
                &ldquo;
              </span>

              {/* Quote Text */}
              <p className="relative text-neutral-700 leading-relaxed text-lg pt-4">
                {testimonial.quote}
              </p>

              {/* Author */}
              <footer className="mt-6 pt-6 border-t border-neutral-200">
                <p className="font-semibold text-neutral-900">
                  {testimonial.author}
                </p>
                <p className="text-sm text-neutral-500">
                  {testimonial.role}
                </p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
