'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plug,
  Check,
  ExternalLink,
  Settings,
  Zap,
  CreditCard,
  MessageSquare,
  Calendar,
  FileText,
  Car,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'payments' | 'communication' | 'scheduling' | 'accounting' | 'parts' | 'analytics';
  connected: boolean;
  popular?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept credit card payments and manage subscriptions',
    icon: CreditCard,
    category: 'payments',
    connected: true,
    popular: true,
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Point of sale and payment processing',
    icon: CreditCard,
    category: 'payments',
    connected: false,
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and customer messaging',
    icon: MessageSquare,
    category: 'communication',
    connected: true,
    popular: true,
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing campaigns',
    icon: MessageSquare,
    category: 'communication',
    connected: false,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync appointments with Google Calendar',
    icon: Calendar,
    category: 'scheduling',
    connected: true,
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Online appointment scheduling for customers',
    icon: Calendar,
    category: 'scheduling',
    connected: false,
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management',
    icon: FileText,
    category: 'accounting',
    connected: true,
    popular: true,
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud-based accounting software',
    icon: FileText,
    category: 'accounting',
    connected: false,
  },
  {
    id: 'carfax',
    name: 'CARFAX',
    description: 'Vehicle history reports and service records',
    icon: Car,
    category: 'parts',
    connected: false,
  },
  {
    id: 'worldpac',
    name: 'WorldPac',
    description: 'Auto parts ordering and catalog',
    icon: Car,
    category: 'parts',
    connected: true,
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website and conversion tracking',
    icon: BarChart3,
    category: 'analytics',
    connected: false,
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'payments', label: 'Payments' },
  { id: 'communication', label: 'Communication' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'parts', label: 'Parts & Vehicles' },
  { id: 'analytics', label: 'Analytics' },
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIntegrations = integrations.filter(
    (integration) => selectedCategory === 'all' || integration.category === selectedCategory
  );

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">
          Integrations
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Connect your favorite tools and services
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-6"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-100 dark:bg-green-900/30">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">
              {connectedCount}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">Connected</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-neutral-400 dark:bg-neutral-600 flex items-center justify-center">
            <Plug className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
              {integrations.length - connectedCount}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Available</p>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              selectedCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            {category.label}
          </button>
        ))}
      </motion.div>

      {/* Integrations Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredIntegrations.map((integration, index) => {
          const Icon = integration.icon;
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className={cn(
                'relative bg-white dark:bg-neutral-800 rounded-2xl border p-6 transition-all hover:shadow-lg cursor-pointer group',
                integration.connected
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-neutral-200 dark:border-neutral-700'
              )}
            >
              {/* Popular Badge */}
              {integration.popular && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
                  Popular
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                integration.connected
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-neutral-100 dark:bg-neutral-700'
              )}>
                <Icon className={cn(
                  'w-7 h-7',
                  integration.connected
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                )} />
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {integration.name}
                  </h3>
                  {integration.connected && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {integration.description}
                </p>
              </div>

              {/* Action */}
              <Button
                variant={integration.connected ? 'outline' : 'default'}
                size="sm"
                className={cn(
                  'w-full rounded-xl',
                  integration.connected
                    ? 'border-neutral-200 dark:border-neutral-700'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                )}
              >
                {integration.connected ? (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </>
                ) : (
                  <>
                    <Plug className="w-4 h-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Custom Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900 rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Need a custom integration?
        </h3>
        <p className="text-neutral-400 mb-6 max-w-md mx-auto">
          We can build custom integrations with your existing tools. Our API supports webhooks, REST, and real-time sync.
        </p>
        <Button className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl">
          <ExternalLink className="w-4 h-4 mr-2" />
          View API Documentation
        </Button>
      </motion.div>
    </div>
  );
}
