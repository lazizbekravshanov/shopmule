"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useState } from "react"
import { RequestDemoModal } from "./request-demo-modal"

const tiers = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "Perfect for small shops getting started.",
    features: [
      "Up to 5 technicians",
      "Unlimited repair orders",
      "Time tracking",
      "Basic reporting",
      "Email support",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$249",
    period: "/month",
    description: "For growing shops that need more.",
    features: [
      "Up to 20 technicians",
      "Everything in Starter",
      "Advanced reporting",
      "Performance TV mode",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Get started",
    popular: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For large operations with specific needs.",
    features: [
      "Unlimited technicians",
      "Everything in Pro",
      "Dedicated support",
      "Custom features",
      "SLA guarantee",
      "Training & onboarding",
    ],
    cta: "Contact sales",
    popular: false,
  },
]

export function PricingSection() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <section id="pricing" className="py-32 border-t border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
            Choose the plan that fits your shop.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
            >
              <Card className={`border-gray-200 h-full relative bg-white ${
                tier.popular 
                  ? 'border-gray-300 shadow-sm' 
                  : 'hover:border-gray-300 hover:shadow-sm transition-all duration-200'
              }`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white border-0 text-xs font-medium">
                    Most popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{tier.name}</CardTitle>
                  <CardDescription className="mt-2 font-light">{tier.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-semibold text-gray-900">{tier.price}</span>
                    {tier.period && (
                      <span className="text-gray-600 ml-1 text-base font-light">{tier.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 font-medium ${
                      tier.popular 
                        ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                        : ''
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => {
                      if (tier.name === "Scale") {
                        setDemoOpen(true)
                      }
                    }}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
