'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Book,
  MessageCircle,
  Video,
  Mail,
  ChevronRight,
  Sparkles,
  Wrench,
  FileText,
  Users,
  Settings,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const quickLinks = [
  {
    title: 'Getting Started',
    description: 'Create your first work order',
    icon: Book,
    href: '/work-orders',
    internal: true,
  },
  {
    title: 'AI Assistant',
    description: 'Use the chat bubble (bottom right)',
    icon: Sparkles,
    href: 'mailto:support@shopmuleai.com',
    internal: false,
  },
  {
    title: 'Contact Support',
    description: 'Email our team directly',
    icon: MessageCircle,
    href: 'mailto:support@shopmuleai.com',
    internal: false,
  },
];

const categories = [
  {
    title: 'Work Orders',
    icon: Wrench,
    href: '/work-orders',
    articles: [
      { title: 'Creating a new work order', href: '/work-orders' },
      { title: 'Adding line items and labor', href: '/work-orders' },
      { title: 'Assigning technicians', href: '/technicians' },
      { title: 'Tracking job progress', href: '/work-orders' },
    ],
  },
  {
    title: 'Invoicing',
    icon: FileText,
    href: '/invoices',
    articles: [
      { title: 'Generating invoices from work orders', href: '/invoices' },
      { title: 'Setting up payment terms', href: '/settings' },
      { title: 'Sending invoices to customers', href: '/invoices' },
      { title: 'Managing overdue payments', href: '/invoices' },
    ],
  },
  {
    title: 'Customers',
    icon: Users,
    href: '/customers',
    articles: [
      { title: 'Adding new customers', href: '/customers' },
      { title: 'Managing vehicle history', href: '/customers' },
      { title: 'Customer communication', href: '/customers' },
      { title: 'Fleet account setup', href: '/fleet-accounts' },
    ],
  },
  {
    title: 'Team',
    icon: Users,
    href: '/technicians',
    articles: [
      { title: 'Adding team members', href: '/technicians' },
      { title: 'Setting up permissions', href: '/settings' },
      { title: 'Technician scheduling', href: '/schedule' },
      { title: 'Time tracking', href: '/time-clock' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    articles: [
      { title: 'Shop profile setup', href: '/settings' },
      { title: 'Tax & labor rate configuration', href: '/settings' },
      { title: 'Geofences & time clock', href: '/settings/geofences' },
      { title: 'Integrations', href: '/integrations' },
    ],
  },
  {
    title: 'Billing',
    icon: CreditCard,
    href: '/settings',
    articles: [
      { title: 'Subscription plans', href: '/settings' },
      { title: 'Payment methods', href: '/settings' },
      { title: 'Invoices and receipts', href: '/invoices' },
      { title: 'Contact billing support', href: 'mailto:billing@shopmuleai.com' },
    ],
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

  const filteredCategories = categories.filter(
    (c) =>
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.articles.some((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
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
        {quickLinks.map((link) => {
          const Icon = link.icon;
          const inner = (
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
          );

          if (link.internal) {
            return <Link key={link.title} href={link.href!}>{inner}</Link>;
          }
          return (
            <a key={link.title} href={link.href!} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          );
        })}
      </motion.div>

      {/* Categories */}
      {filteredCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Browse by Category
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category, index) => {
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
                    <Link href={category.href} className="font-semibold text-neutral-900 dark:text-white hover:text-orange-600 transition-colors">
                      {category.title}
                    </Link>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article) => {
                      const isExternal = article.href.startsWith('mailto:');
                      return (
                        <li key={article.title}>
                          {isExternal ? (
                            <a
                              href={article.href}
                              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
                            >
                              {article.title}
                              <ExternalLink className="w-3 h-3 opacity-50" />
                            </a>
                          ) : (
                            <Link
                              href={article.href}
                              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            >
                              {article.title}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* FAQs */}
      {filteredFaqs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900 rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
            <p className="text-neutral-400">Our support team is here to help you succeed.</p>
          </div>
          <div className="flex flex-wrap gap-3">
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
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              asChild
            >
              <a href="mailto:support@shopmuleai.com">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
