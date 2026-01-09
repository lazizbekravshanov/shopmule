"use client"

import { motion } from "framer-motion"
import { Zap, Brain, BarChart3 } from "lucide-react"

const benefits = [
  {
    icon: Zap,
    title: "Real-time visibility",
    description: "See what's happening in your shop as it happens, not hours later.",
  },
  {
    icon: Brain,
    title: "Smarter workflows",
    description: "Automated tracking reduces manual entry and human error.",
  },
  {
    icon: BarChart3,
    title: "Less manual work",
    description: "Focus on repairs, not paperwork. Let the system handle the rest.",
  },
]

export function WhyDifferent() {
  return (
    <section className="py-32 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
            Why it feels different
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
            Built with modern practices, not legacy baggage.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-gray-200 bg-gray-50/50 mb-6">
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
