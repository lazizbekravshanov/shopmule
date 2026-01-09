"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How quickly can we get started?",
    answer: "You can be up and running in minutes. Set up your shop, add technicians, and start tracking repair orders immediately. Our onboarding process takes about 15 minutes.",
  },
  {
    question: "Do you offer training?",
    answer: "Yes. All plans include email support and documentation. Pro and Scale plans include priority support and training sessions to get your team comfortable with the system.",
  },
  {
    question: "Can we customize it for our workflow?",
    answer: "BodyShopper is designed to work with standard shop workflows out of the box. Scale plans include custom feature development to match your specific needs.",
  },
  {
    question: "What about data security?",
    answer: "We take security seriously. All data is encrypted in transit and at rest. Each shop's data is completely isolated in our multi-tenant architecture.",
  },
  {
    question: "Can we export our data?",
    answer: "Yes, you can export all your data at any time in standard formats (CSV, JSON). Your data belongs to you.",
  },
  {
    question: "What if we need to cancel?",
    answer: "You can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your data remains accessible for 30 days after cancellation.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-32 border-t border-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Frequently asked questions
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about BodyShopper.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-gray-200">
              <AccordionTrigger className="text-left text-gray-900 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
