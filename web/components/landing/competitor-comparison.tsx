'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

type FeatureValue = boolean | 'partial' | string;

interface Feature {
  name: string;
  shopmule: FeatureValue;
  ccc: FeatureValue;
  mitchell: FeatureValue;
  shopmonkey: FeatureValue;
  description?: string;
}

const features: Feature[] = [
  {
    name: 'AI-Powered Estimates',
    shopmule: true,
    ccc: false,
    mitchell: false,
    shopmonkey: false,
    description: 'Auto-generate repair estimates from photos',
  },
  {
    name: 'Modern Cloud Architecture',
    shopmule: true,
    ccc: 'partial',
    mitchell: false,
    shopmonkey: true,
  },
  {
    name: 'Customer Portal',
    shopmule: true,
    ccc: 'partial',
    mitchell: false,
    shopmonkey: true,
  },
  {
    name: 'Real-time Status Updates',
    shopmule: true,
    ccc: false,
    mitchell: false,
    shopmonkey: true,
  },
  {
    name: 'Mobile App',
    shopmule: true,
    ccc: 'partial',
    mitchell: false,
    shopmonkey: true,
  },
  {
    name: 'Integrated Payments',
    shopmule: true,
    ccc: false,
    mitchell: false,
    shopmonkey: true,
  },
  {
    name: 'Parts Ordering Integration',
    shopmule: true,
    ccc: true,
    mitchell: true,
    shopmonkey: 'partial',
  },
  {
    name: 'Insurance DRP Integration',
    shopmule: true,
    ccc: true,
    mitchell: true,
    shopmonkey: false,
  },
  {
    name: 'Multi-Location Support',
    shopmule: true,
    ccc: true,
    mitchell: true,
    shopmonkey: true,
  },
  {
    name: 'Time Clock & Labor Tracking',
    shopmule: true,
    ccc: 'partial',
    mitchell: 'partial',
    shopmonkey: true,
  },
  {
    name: 'SMS/Email Automation',
    shopmule: true,
    ccc: false,
    mitchell: false,
    shopmonkey: true,
  },
  {
    name: 'Modern UI/UX',
    shopmule: true,
    ccc: false,
    mitchell: false,
    shopmonkey: true,
  },
];

const pricing = [
  { name: 'Starting Price', shopmule: '$199/mo', ccc: '$500+/mo', mitchell: '$400+/mo', shopmonkey: '$249/mo' },
  { name: 'Implementation', shopmule: 'Free', ccc: '$2,000+', mitchell: '$1,500+', shopmonkey: '$500' },
  { name: 'Contract Length', shopmule: 'Monthly', ccc: 'Annual', mitchell: 'Annual', shopmonkey: 'Monthly' },
];

const competitors = [
  { key: 'shopmule', name: 'ShopMule', highlight: true },
  { key: 'ccc', name: 'CCC ONE', highlight: false },
  { key: 'mitchell', name: 'Mitchell', highlight: false },
  { key: 'shopmonkey', name: 'ShopMonkey', highlight: false },
];

function FeatureIcon({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="w-4 h-4 text-green-600" />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
        <X className="w-4 h-4 text-red-500" />
      </div>
    );
  }
  if (value === 'partial') {
    return (
      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
        <Minus className="w-4 h-4 text-yellow-600" />
      </div>
    );
  }
  return <span className="text-sm text-neutral-600">{value}</span>;
}

export function CompetitorComparison() {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4"
          >
            Competitive Analysis
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4"
          >
            Why Shops Switch to ShopMule
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            The legacy players are stuck in the past. See how ShopMule stacks up against the competition.
          </motion.p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
        >
          {/* Table Header */}
          <div className="grid grid-cols-5 bg-neutral-100 border-b border-neutral-200">
            <div className="p-4 font-medium text-neutral-700">Features</div>
            {competitors.map((comp) => (
              <div
                key={comp.key}
                className={`p-4 text-center font-semibold ${
                  comp.highlight
                    ? 'bg-orange-500 text-white'
                    : 'text-neutral-700'
                }`}
              >
                {comp.name}
                {comp.highlight && (
                  <span className="block text-xs font-normal text-orange-100">Recommended</span>
                )}
              </div>
            ))}
          </div>

          {/* Feature Rows */}
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className={`grid grid-cols-5 border-b border-neutral-100 ${
                index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
              }`}
            >
              <div className="p-4">
                <span className="text-sm font-medium text-neutral-900">{feature.name}</span>
                {feature.description && (
                  <span className="block text-xs text-neutral-500 mt-0.5">{feature.description}</span>
                )}
              </div>
              {competitors.map((comp) => (
                <div
                  key={comp.key}
                  className={`p-4 flex items-center justify-center ${
                    comp.highlight ? 'bg-orange-50' : ''
                  }`}
                >
                  <FeatureIcon value={feature[comp.key as keyof Feature] as FeatureValue} />
                </div>
              ))}
            </div>
          ))}

          {/* Pricing Section */}
          <div className="bg-neutral-100 border-t border-neutral-200">
            <div className="grid grid-cols-5 border-b border-neutral-200">
              <div className="p-4 font-medium text-neutral-700">Pricing</div>
              {competitors.map((comp) => (
                <div
                  key={comp.key}
                  className={`p-4 ${comp.highlight ? 'bg-orange-100' : ''}`}
                />
              ))}
            </div>
            {pricing.map((item) => (
              <div key={item.name} className="grid grid-cols-5 border-b border-neutral-100 last:border-b-0">
                <div className="p-4 text-sm text-neutral-600">{item.name}</div>
                {competitors.map((comp) => (
                  <div
                    key={comp.key}
                    className={`p-4 text-center text-sm font-medium ${
                      comp.highlight ? 'bg-orange-50 text-orange-700' : 'text-neutral-700'
                    }`}
                  >
                    {item[comp.key as keyof typeof item]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span>Full Support</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
              <Minus className="w-3 h-3 text-yellow-600" />
            </div>
            <span>Partial/Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-3 h-3 text-red-500" />
            </div>
            <span>Not Available</span>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-600 mb-4">
            Ready to upgrade from legacy software?
          </p>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Schedule a Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
