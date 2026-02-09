'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Quote, TrendingUp, Clock, DollarSign, Users } from 'lucide-react';

const caseStudies = [
  {
    company: "Mike's Auto Body",
    location: 'Austin, TX',
    logo: 'MA',
    quote: "ShopMule transformed our shop. We went from chaos to clockwork in just 30 days.",
    author: 'Mike Rodriguez',
    role: 'Owner',
    image: '/testimonials/mike.jpg',
    metrics: [
      { label: 'Efficiency Increase', value: '47%', icon: TrendingUp },
      { label: 'Time Saved Weekly', value: '12hrs', icon: Clock },
      { label: 'Revenue Growth', value: '+$180K', icon: DollarSign },
    ],
    beforeAfter: {
      before: ['Paper work orders', 'Manual invoicing', 'Phone tag with customers', 'Lost parts orders'],
      after: ['Digital everything', 'Auto-generated invoices', 'Customer portal', 'Inventory tracking'],
    },
  },
  {
    company: 'Premier Collision Center',
    location: 'Denver, CO',
    logo: 'PC',
    quote: "We doubled our capacity without adding staff. The ROI was immediate.",
    author: 'Sarah Chen',
    role: 'General Manager',
    image: '/testimonials/sarah.jpg',
    metrics: [
      { label: 'Capacity Increase', value: '2x', icon: Users },
      { label: 'Cycle Time Reduction', value: '35%', icon: Clock },
      { label: 'Monthly Savings', value: '$8.5K', icon: DollarSign },
    ],
    beforeAfter: {
      before: ['3-day estimate turnaround', 'Missed follow-ups', 'Payment delays', 'No visibility'],
      after: ['Same-day estimates', 'Automated reminders', 'Online payments', 'Real-time dashboard'],
    },
  },
  {
    company: 'Eastside Auto Repair',
    location: 'Seattle, WA',
    logo: 'EA',
    quote: "Our customer satisfaction scores went from 3.2 to 4.8 stars. Game changer.",
    author: 'James Park',
    role: 'Owner',
    image: '/testimonials/james.jpg',
    metrics: [
      { label: 'Customer Rating', value: '4.8★', icon: Users },
      { label: 'Repeat Customers', value: '+62%', icon: TrendingUp },
      { label: 'Annual Revenue', value: '+$420K', icon: DollarSign },
    ],
    beforeAfter: {
      before: ['No customer updates', 'Handwritten estimates', 'Cash only', 'No reviews'],
      after: ['SMS notifications', 'Professional PDFs', 'Card payments', '200+ 5-star reviews'],
    },
  },
];

export function CaseStudies() {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4"
          >
            Real Results
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4"
          >
            Success Stories From Real Shops
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            See how shops like yours are saving time, increasing revenue, and delighting customers with ShopMule.
          </motion.p>
        </div>

        {/* Case Study Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow group"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {study.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{study.company}</h3>
                    <p className="text-sm text-neutral-500">{study.location}</p>
                  </div>
                </div>

                {/* Quote */}
                <div className="relative">
                  <Quote className="absolute -top-1 -left-1 w-6 h-6 text-orange-200" />
                  <p className="text-neutral-700 italic pl-6">&ldquo;{study.quote}&rdquo;</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-neutral-200 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{study.author}</p>
                    <p className="text-xs text-neutral-500">{study.role}</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="p-6 bg-neutral-50">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Key Results</p>
                <div className="space-y-3">
                  {study.metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-600">{metric.label}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Before/After Toggle - simplified to just show after */}
              <div className="p-6 border-t border-neutral-100">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-medium text-red-600 mb-2">Before</p>
                    <ul className="space-y-1">
                      {study.beforeAfter.before.slice(0, 2).map((item) => (
                        <li key={item} className="text-neutral-500 line-through">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-green-600 mb-2">After</p>
                    <ul className="space-y-1">
                      {study.beforeAfter.after.slice(0, 2).map((item) => (
                        <li key={item} className="text-neutral-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <button className="w-full py-2.5 text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                  Read Full Case Study
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-600 mb-4">
            Join 500+ shops already growing with ShopMule
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Start Your Success Story
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
