'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "BodyShopper transformed how we run our shop. We went from chaos to organized in just a week. The time tracking alone saved us thousands in lost billable hours.",
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
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wider">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by shop owners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
              className="relative bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors"
            >
              <Quote className="w-10 h-10 text-gray-200 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
