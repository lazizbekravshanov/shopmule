'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How quickly can we get started?',
    answer: 'Most shops are up and running within 15 minutes. Create your account, add your team, and start tracking work orders immediately.',
  },
  {
    question: 'Do you offer training?',
    answer: 'All plans include documentation and email support. Professional and Enterprise plans include dedicated onboarding sessions.',
  },
  {
    question: 'Can we customize it for our workflow?',
    answer: 'ShopMule works with standard shop workflows out of the box. Enterprise plans include custom configuration to match your specific processes.',
  },
  {
    question: 'What about data security?',
    answer: 'All data is encrypted in transit and at rest. Each shop\'s data is isolated in our multi-tenant architecture. We take security seriously.',
  },
  {
    question: 'Can we export our data?',
    answer: 'Yes. Export all your data at any time in CSV or JSON format. Your data belongs to you.',
  },
  {
    question: 'What if we need to cancel?',
    answer: 'Cancel anytime with no fees or penalties. Your data remains accessible for 30 days after cancellation.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
            FAQ
          </span>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
            Questions?
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-neutral-200"
              >
                <AccordionTrigger className="text-left text-neutral-900 hover:no-underline font-medium py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-600 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Link */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-neutral-500"
        >
          Still have questions?{' '}
          <a
            href="mailto:support@shopmule.com"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact us
          </a>
        </motion.p>
      </div>
    </section>
  );
}
