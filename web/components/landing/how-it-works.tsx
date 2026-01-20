"use client"

import { motion } from "framer-motion"

const steps = [
  {
    number: "01",
    title: "Set up your shop",
    description: "Add technicians, bays, and parts inventory in minutes.",
  },
  {
    number: "02",
    title: "Start tracking",
    description: "Technicians clock in, start repair orders, and log time per job.",
  },
  {
    number: "03",
    title: "Run smoothly",
    description: "Generate invoices, track performance, and keep organized.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-32 border-t border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-20"
      >
        <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-5 tracking-tight">
          How it works
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-4xl font-light text-gray-300 mb-6 tracking-tight">
              {step.number}
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed font-light">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
