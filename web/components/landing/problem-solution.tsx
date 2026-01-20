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
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stop fighting your tools.
            <br />
            <span className="text-gray-400">Start running your shop.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 rounded-2xl p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">The Old Way</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <motion.li
                  key={problem.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3 text-gray-600"
                >
                  <problem.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span>{problem.text}</span>
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
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">The BodyShopper Way</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.li
                  key={solution.text}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <solution.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>{solution.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
