"use client"

import { motion } from "framer-motion"

const benefits = [
  {
    title: "Real-time visibility",
    description: "See what's happening in your shop as it happens, not hours later.",
  },
  {
    title: "Smarter workflows",
    description: "Automated tracking reduces manual entry and human error.",
  },
  {
    title: "Less manual work",
    description: "Focus on repairs, not paperwork. Let the system handle the rest.",
  },
]

export function WhyDifferent() {
  return (
    <section className="py-32 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-5 tracking-tight">
            Why BodyShopper
          </h2>
        </motion.div>

        <div className="space-y-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-2xl font-medium text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed font-light text-lg">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
