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
    <section id="faq" className="py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header - Apple style: centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            Questions? Answers.
          </h2>
        </motion.div>

        {/* FAQ Accordion - Apple style: cleaner, more spacious */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-none bg-neutral-50 rounded-2xl px-6 data-[state=open]:bg-neutral-100 transition-colors duration-300"
              >
                <AccordionTrigger className="text-left text-neutral-900 hover:no-underline font-medium py-6 text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-500 leading-relaxed pb-6 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Link - Apple style: centered */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 text-center text-neutral-500"
        >
          Still have questions?{' '}
          <a
            href="mailto:support@shopmule.com"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Get in touch
          </a>
        </motion.p>
      </div>
    </section>
  );
}
