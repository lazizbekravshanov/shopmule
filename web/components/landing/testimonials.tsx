'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "ShopMule transformed how we run our shop. We went from chaos to organized in just a week. The time tracking alone saved us thousands in lost billable hours.",
    author: "Mike Rodriguez",
    role: "Owner, Rodriguez Truck Repair",
    rating: 5,
  },
  {
    quote: "The digital inspections feature is a game-changer. Our customers love getting photos and videos of their vehicle issues. Trust has never been higher.",
    author: "Sarah Chen",
    role: "Service Manager, FleetMax",
    rating: 5,
  },
  {
    quote: "Finally, software that actually understands repair shops. The interface is clean, fast, and my technicians picked it up in minutes, not days.",
    author: "James Williams",
    role: "Owner, Williams Auto & Diesel",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary-600 mb-3 uppercase tracking-widest">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Loved by shop owners
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Don&apos;t just take our word for it. Here&apos;s what our customers have to say.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-neutral-50 rounded-2xl p-8 border border-neutral-100 hover:border-primary-100 hover:shadow-premium-lg transition-all duration-300"
            >
              <Quote className="w-10 h-10 text-neutral-200 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warning-500 fill-warning-500" />
                ))}
              </div>

              <p className="text-neutral-700 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div>
                <p className="font-semibold text-neutral-900">{testimonial.author}</p>
                <p className="text-sm text-neutral-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
