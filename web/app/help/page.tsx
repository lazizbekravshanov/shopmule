'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Book,
  MessageCircle,
  Video,
  Mail,
  Phone,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Wrench,
  FileText,
  Users,
  Settings,
  CreditCard,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const quickLinks = [
  { title: 'Getting Started', description: 'Learn the basics of ShopMule', icon: Book, href: '#' },
  { title: 'Video Tutorials', description: 'Watch step-by-step guides', icon: Video, href: '#' },
  { title: 'Contact Support', description: 'Get help from our team', icon: MessageCircle, href: '#' },
];

const categories = [
  {
    title: 'Work Orders',
    icon: Wrench,
    articles: [
      'Creating a new work order',
      'Adding line items and labor',
      'Assigning technicians',
      'Tracking job progress',
    ],
  },
  {
    title: 'Invoicing',
    icon: FileText,
    articles: [
      'Generating invoices from work orders',
      'Setting up payment terms',
      'Sending invoices to customers',
      'Managing overdue payments',
    ],
  },
  {
    title: 'Customers',
    icon: Users,
    articles: [
      'Adding new customers',
      'Managing vehicle history',
      'Customer communication',
      'Fleet account setup',
    ],
  },
  {
    title: 'Team',
    icon: Users,
    articles: [
      'Adding team members',
      'Setting up permissions',
      'Technician scheduling',
      'Performance tracking',
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    articles: [
      'Shop profile setup',
      'Tax configuration',
      'Email templates',
      'Integrations',
    ],
  },
  {
    title: 'Billing',
    icon: CreditCard,
    articles: [
      'Subscription plans',
      'Payment methods',
      'Invoices and receipts',
      'Cancellation policy',
    ],
  },
];

const faqs = [
  {
    question: 'How do I create my first work order?',
    answer: 'Navigate to Work Orders > New Work Order, select or add a customer, add their vehicle, and then add the services or repairs needed.',
  },
  {
    question: 'Can I import my existing customers?',
    answer: 'Yes! Go to Customers > Import and upload a CSV file with your customer data. We support imports from most popular shop management systems.',
  },
  {
    question: 'How do I set up online payments?',
    answer: 'Go to Settings > Integrations > Stripe and connect your Stripe account. Once connected, customers can pay invoices online.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption (256-bit SSL), secure data centers, and regular security audits to protect your data.',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
          Search our knowledge base or browse categories below
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
            placeholder="Search for help articles..."
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
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <a
              key={link.title}
              href={link.href}
              className="flex items-center gap-4 p-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {link.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {link.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </a>
          );
        })}
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
          Browse by Category
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {category.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article}>
                      <a
                        href="#"
                        className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700 overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <span className="font-medium text-neutral-900 dark:text-white pr-4">
                  {faq.question}
                </span>
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

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900 rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Still need help?
            </h3>
            <p className="text-neutral-400">
              Our support team is here to help you succeed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-xl"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
