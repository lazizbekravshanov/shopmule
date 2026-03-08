'use client';

import { motion } from 'framer-motion';
import {
  Plug,
  Check,
  ExternalLink,
  Zap,
  CreditCard,
  MessageSquare,
  Calendar,
  FileText,
  Car,
  BarChart3,
  Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IntegrationStatus = 'connected' | 'env-configured' | 'coming-soon';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'payments' | 'communication' | 'scheduling' | 'accounting' | 'parts' | 'analytics';
  status: IntegrationStatus;
  popular?: boolean;
  docsUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept credit card payments and manage subscriptions',
    icon: CreditCard,
    category: 'payments',
    status: 'connected',
    popular: true,
    docsUrl: 'https://dashboard.stripe.com',
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Point of sale and payment processing',
    icon: CreditCard,
    category: 'payments',
    status: 'coming-soon',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and customer messaging',
    icon: MessageSquare,
    category: 'communication',
    status: 'env-configured',
    popular: true,
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing campaigns',
    icon: MessageSquare,
    category: 'communication',
    status: 'env-configured',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync appointments with Google Calendar',
    icon: Calendar,
    category: 'scheduling',
    status: 'coming-soon',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management',
    icon: FileText,
    category: 'accounting',
    popular: true,
    status: 'coming-soon',
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud-based accounting software',
    icon: FileText,
    category: 'accounting',
    status: 'coming-soon',
  },
  {
    id: 'carfax',
    name: 'CARFAX',
    description: 'Vehicle history reports and service records',
    icon: Car,
    category: 'parts',
    status: 'coming-soon',
  },
  {
    id: 'worldpac',
    name: 'WorldPac',
    description: 'Auto parts ordering and catalog',
    icon: Car,
    category: 'parts',
    status: 'coming-soon',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website and conversion tracking',
    icon: BarChart3,
    category: 'analytics',
    status: 'coming-soon',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'payments', label: 'Payments' },
  { id: 'communication', label: 'Communication' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'parts', label: 'Parts & Vehicles' },
  { id: 'analytics', label: 'Analytics' },
];

import { useState } from 'react';

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = INTEGRATIONS.filter(
    (i) => selectedCategory === 'all' || i.category === selectedCategory
  );

  const connectedCount = INTEGRATIONS.filter((i) => i.status === 'connected' || i.status === 'env-configured').length;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">Integrations</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Connect your favorite tools and services</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-100 dark:bg-green-900/30">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">{connectedCount}</p>
            <p className="text-xs text-green-600 dark:text-green-500">Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-neutral-400 dark:bg-neutral-600 flex items-center justify-center">
            <Plug className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">{INTEGRATIONS.length - connectedCount}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Coming Soon</p>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((integration, index) => {
          const Icon = integration.icon;
          const isActive = integration.status === 'connected' || integration.status === 'env-configured';
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.04 }}
              className={cn(
                'relative bg-white dark:bg-neutral-800 rounded-2xl border p-6 transition-all hover:shadow-lg',
                isActive ? 'border-green-200 dark:border-green-800' : 'border-neutral-200 dark:border-neutral-700'
              )}
            >
              {integration.popular && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
                  Popular
                </div>
              )}
              {integration.status === 'coming-soon' && !integration.popular && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 text-xs font-medium">
                  Coming Soon
                </div>
              )}

              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-neutral-100 dark:bg-neutral-700'
              )}>
                <Icon className={cn('w-7 h-7', isActive ? 'text-green-600 dark:text-green-400' : 'text-neutral-500 dark:text-neutral-400')} />
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{integration.name}</h3>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{integration.description}</p>
              </div>

              <div className="flex gap-2">
                {integration.status === 'connected' && integration.docsUrl && (
                  <Button variant="outline" size="sm" className="w-full rounded-xl border-neutral-200 dark:border-neutral-700" asChild>
                    <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Dashboard
                    </a>
                  </Button>
                )}
                {integration.status === 'env-configured' && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Server className="w-4 h-4" />
                    Configured via environment variables
                  </div>
                )}
                {integration.status === 'coming-soon' && (
                  <div className="text-sm text-neutral-400 dark:text-neutral-500">
                    Coming Soon
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Custom Integration CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Need a custom integration?</h3>
        <p className="text-neutral-400 mb-6 max-w-md mx-auto">
          We can build custom integrations with your existing tools. Contact us to discuss your needs.
        </p>
        <Button className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl" asChild>
          <a href="mailto:support@shopmuleai.com?subject=Custom Integration Request">
            <ExternalLink className="w-4 h-4 mr-2" />
            Request Custom Integration
          </a>
        </Button>
      </motion.div>
    </div>
  );
}
