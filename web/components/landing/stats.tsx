"use client"

import { motion } from "framer-motion"

const stats = [
  {
    value: "50%",
    label: "Faster invoicing",
  },
  {
    value: "3x",
    label: "Better visibility",
  },
  {
    value: "85%",
    label: "Less paperwork",
  },
]

export function StatsSection() {
  return (
    <section className="py-20 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-light text-gray-900 mb-3 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-light">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
