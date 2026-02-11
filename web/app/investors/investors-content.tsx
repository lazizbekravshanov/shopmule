'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Globe,
  Zap,
  ArrowUpRight,
  Building2,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Mail,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';

const metrics = [
  { label: 'ARR', value: '$2.4M', growth: '+340% YoY' },
  { label: 'Active Shops', value: '527', growth: '+127% YoY' },
  { label: 'Net Revenue Retention', value: '142%', growth: null },
  { label: 'Gross Margin', value: '82%', growth: null },
];

const highlights = [
  {
    icon: Target,
    title: '$52B TAM',
    description: 'Massive, underserved market with 88% of shops still on paper or legacy software',
  },
  {
    icon: TrendingUp,
    title: '340% ARR Growth',
    description: 'Rapid adoption driven by word-of-mouth and best-in-class product experience',
  },
  {
    icon: Zap,
    title: 'AI-First Platform',
    description: 'First-mover advantage in AI-powered estimates, reducing time from hours to minutes',
  },
  {
    icon: Globe,
    title: 'Land & Expand',
    description: '142% NRR driven by multi-location expansion and upsells to premium features',
  },
];

const milestones = [
  { year: '2022 Q1', event: 'Founded in Austin, TX' },
  { year: '2022 Q3', event: 'Seed round: $4.2M led by Lead Venture Partner' },
  { year: '2023 Q1', event: 'Product launch, 50 beta shops' },
  { year: '2023 Q4', event: '200 active shops, $800K ARR' },
  { year: '2024 Q2', event: '400 shops, $1.5M ARR' },
  { year: '2024 Q4', event: '527 shops, $2.4M ARR' },
  { year: '2025', event: 'Series A (raising now)' },
];

const useOfFunds = [
  { category: 'Engineering', percentage: 45, description: 'AI/ML, mobile app, integrations' },
  { category: 'Sales & Marketing', percentage: 35, description: 'Field sales team, digital marketing' },
  { category: 'Customer Success', percentage: 15, description: 'Onboarding, support, retention' },
  { category: 'G&A', percentage: 5, description: 'Operations, legal, finance' },
];

const investors = [
  { name: 'Lead Venture Partner', type: 'Lead Investor' },
  { name: 'Growth Capital Fund', type: 'Series Seed' },
  { name: 'Strategic Angels', type: 'Strategic' },
];

export function InvestorsContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 bg-neutral-700 text-neutral-300 rounded-full text-sm font-medium mb-6">
              Series A
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Modernizing the $52B Auto Body Repair Industry
            </h1>
            <p className="text-xl text-neutral-300 mb-8">
              ShopMule is the AI-powered shop management platform that&apos;s transforming how
              35,000+ independent body shops operate. We&apos;re raising our Series A.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:investors@shopmule.com"
                className="inline-flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Deck
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-12 bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-neutral-400 mb-1">{metric.label}</div>
                {metric.growth && (
                  <div className="text-xs text-green-400 font-medium">{metric.growth}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Investment Highlights
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 bg-neutral-50 rounded-xl"
              >
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <highlight.icon className="w-6 h-6 text-neutral-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{highlight.title}</h3>
                  <p className="text-neutral-600">{highlight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                Market Opportunity
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                The auto body repair industry is massive, fragmented, and ripe for disruption.
                88% of independent shops still rely on paper-based processes or legacy software
                built in the 1990s.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-neutral-700">35,000+ independent body shops in the US</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-neutral-700">15% industry CAGR driven by vehicle complexity</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-neutral-700">Increasing EV adoption creating new repair needs</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-neutral-700">Consolidation creating multi-location operators</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* TAM/SAM/SOM circles */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-72 h-72 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full bg-neutral-200 border-2 border-neutral-300 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-neutral-700 flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-lg font-bold">$850M</div>
                          <div className="text-xs">SOM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-0 text-right">
                    <div className="text-2xl font-bold text-neutral-700">$52B</div>
                    <div className="text-sm text-neutral-500">TAM</div>
                  </div>
                  <div className="absolute top-20 -right-4 text-right">
                    <div className="text-xl font-bold text-neutral-600">$8.2B</div>
                    <div className="text-sm text-neutral-500">SAM</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Company Timeline
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-neutral-200" />

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`w-5/12 ${
                      index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'
                    }`}
                  >
                    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm inline-block">
                      <div className="text-sm font-semibold text-neutral-600">{milestone.year}</div>
                      <div className="text-neutral-700">{milestone.event}</div>
                    </div>
                  </div>
                  {/* Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-neutral-700 rounded-full border-4 border-white shadow" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Use of Funds
            </h2>
            <p className="text-lg text-neutral-600">
              We&apos;re raising $15M to accelerate growth and expand our AI capabilities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {useOfFunds.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-neutral-200 rounded-xl p-6 text-center"
              >
                <div className="text-4xl font-bold text-neutral-600 mb-2">
                  {item.percentage}%
                </div>
                <div className="text-lg font-semibold text-neutral-900 mb-2">
                  {item.category}
                </div>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Investors */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Backed By
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-12">
            {investors.map((investor, index) => (
              <motion.div
                key={investor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-neutral-400" />
                </div>
                <div className="font-semibold text-neutral-900">{investor.name}</div>
                <div className="text-sm text-neutral-500">{investor.type}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Let&apos;s Talk
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
              We&apos;re raising our Series A to accelerate growth and expand our AI capabilities.
              If you&apos;re interested in learning more, we&apos;d love to connect.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:investors@shopmule.com"
                className="inline-flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                <Mail className="w-5 h-5" />
                investors@shopmule.com
              </a>
            </div>
            <p className="text-neutral-500 text-sm mt-8">
              Or schedule a call directly with our CEO at{' '}
              <a href="#" className="text-neutral-400 hover:text-neutral-300">
                calendly.com/shopmule-alex
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
