"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Set up your shop",
    description: "Add your technicians, bays, and parts inventory in minutes.",
  },
  {
    number: "02",
    title: "Start tracking",
    description: "Technicians clock in, start repair orders, and log time per job.",
  },
  {
    number: "03",
    title: "Run smoothly",
    description: "Generate invoices, track performance, and keep your shop organized.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-32 border-t border-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          How it works
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Simple. Fast. Effective.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-gray-200 mb-4">
              {step.number}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
