"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { FileText, Clock, Grid3x3, Package, Receipt, Tv, type LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: FileText,
    title: "Repair orders",
    description: "Complete workflow from draft to completion with full history.",
  },
  {
    icon: Clock,
    title: "Time clock",
    description: "Accurate shift and per-job time tracking for all technicians.",
  },
  {
    icon: Grid3x3,
    title: "Bay scheduling",
    description: "Assign work to bays and technicians with real-time visibility.",
  },
  {
    icon: Package,
    title: "Parts & inventory",
    description: "Track inventory levels and link parts to repair orders automatically.",
  },
  {
    icon: Receipt,
    title: "Invoices",
    description: "Generate invoices from repair orders and track all payments.",
  },
  {
    icon: Tv,
    title: "Performance TV",
    description: "Real-time shop floor leaderboard showing technician metrics.",
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

interface FeatureCardProps {
  feature: Feature
  index: number
}

const FeatureCard = memo(function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon
  return (
    <motion.article
      {...fadeInUp}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4"
    >
      <div
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
        aria-hidden="true"
      >
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
        <p className="text-gray-600 leading-relaxed font-light text-sm">
          {feature.description}
        </p>
      </div>
    </motion.article>
  )
})

export function FeatureGrid() {
  return (
    <section id="features" className="py-32" aria-labelledby="features-heading">
      <motion.div
        {...fadeInUp}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-20"
      >
        <h2
          id="features-heading"
          className="text-5xl md:text-6xl font-light text-gray-900 mb-5 tracking-tight"
        >
          Features
        </h2>
      </motion.div>

      <div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        role="list"
        aria-label="Product features"
      >
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </section>
  )
}
