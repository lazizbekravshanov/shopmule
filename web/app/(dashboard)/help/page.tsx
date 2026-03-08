'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Book,
  MessageCircle,
  Mail,
  ChevronRight,
  Sparkles,
  Wrench,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const quickLinks = [
  {
    title: 'Work Orders',
    description: 'Create and manage repair jobs',
    icon: Wrench,
    href: '/work-orders',
  },
  {
    title: 'Invoices',
    description: 'Billing and payment tracking',
    icon: FileText,
    href: '/invoices',
  },
  {
    title: 'Time Clock',
    description: 'Employee time tracking',
    icon: Clock,
    href: '/time-clock',
  },
];

const faqs = [
  {
    question: 'How do I create my first work order?',
    answer: 'Navigate to Work Orders and click "New Work Order". Select or add a customer, choose their vehicle, add the services or repairs needed, and assign a technician.',
  },
  {
    question: 'Can I import my existing customers?',
    answer: 'Yes — go to Customers and use the Import option to upload a CSV file with your customer data. We support imports from most popular shop management systems.',
  },
  {
    question: 'How do I set up online payments?',
    answer: 'Go to Integrations — Stripe is already connected. Customers can pay invoices online via the payment link on any invoice.',
  },
  {
    question: 'How does the time clock work?',
    answer: 'Go to Time Clock, select an employee, and use the Clock In/Out buttons. Employees can also clock in via the mobile app using geofence verification.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use 256-bit SSL encryption, secure data centers, tenant isolation (your data is never shared across accounts), and regular security audits.',
  },
  {
    question: 'How do I add a fleet account?',
    answer: 'Go to Fleet Accounts and click "Add Fleet Account". Set the company name, payment terms, discount rate, and credit limit. Fleet customers get a dedicated account number automatically.',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (f) =>
      !searchQuery ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight mb-2">
          How can we help you?
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Search our FAQ or reach out to our support team
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-xl mx-auto"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg rounded-2xl border-neutral-200 dark:border-neutral-700"
          />
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.title} href={link.href}>
              <div className="flex items-center gap-4 p-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{link.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{link.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* FAQs */}
      {filteredFaqs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700 overflow-hidden">
            {filteredFaqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <span className="font-medium text-neutral-900 dark:text-white pr-4">{faq.question}</span>
                  <ChevronRight
                    className={cn(
                      'w-5 h-5 text-neutral-400 transition-transform flex-shrink-0',
                      expandedFaq === index && 'rotate-90'
                    )}
                  />
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-6 pb-6 text-neutral-600 dark:text-neutral-400"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900 rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
            <p className="text-neutral-400">Our support team is here to help you succeed.</p>
          </div>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 rounded-xl"
            asChild
          >
            <a href="mailto:support@shopmuleai.com">
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </a>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
