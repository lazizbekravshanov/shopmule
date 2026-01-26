'use client';

import { motion } from 'framer-motion';
import { X, Check, FileText, Users, DollarSign, Package, MessageSquare, ClipboardList } from 'lucide-react';

const problems = [
  { icon: FileText, text: 'Paper-based job tracking' },
  { icon: Users, text: 'Lost customer information' },
  { icon: DollarSign, text: 'Manual invoicing nightmares' },
  { icon: Package, text: 'Inventory chaos' },
  { icon: MessageSquare, text: 'Poor customer communication' },
  { icon: ClipboardList, text: 'No visibility into operations' },
];

const solutions = [
  { icon: FileText, text: 'Digital work orders with photos' },
  { icon: Users, text: 'Complete customer history' },
  { icon: DollarSign, text: 'One-click invoicing' },
  { icon: Package, text: 'Real-time inventory tracking' },
  { icon: MessageSquare, text: 'Automated customer updates' },
  { icon: ClipboardList, text: 'Live dashboard insights' },
];

export function ProblemSolution() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            Stop fighting your tools.
            <br />
            <span className="text-neutral-400">Start running your shop.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-error-50 rounded-xl flex items-center justify-center">
                <X className="w-5 h-5 text-error-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">The Old Way</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <motion.li
                  key={problem.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-4 text-neutral-600"
                >
                  <problem.icon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  <span className="text-base">{problem.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary-50 to-primary-50/50 rounded-2xl p-8 border border-primary-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-success-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">The ShopMule Way</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.li
                  key={solution.text}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-4 text-neutral-700"
                >
                  <solution.icon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span className="text-base">{solution.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
