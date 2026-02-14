'use client';

import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';

const team = [
  {
    name: 'Lazizbek Ravshanov',
    role: 'CEO & Co-Founder',
    bio: 'Visionary entrepreneur passionate about modernizing the auto repair industry with AI-powered solutions.',
    image: '/team/lazizbek.jpg',
    initials: 'LR',
    linkedin: 'https://linkedin.com/in/lazizbek-ravshanov',
  },
  {
    name: 'Sherzod Norkobilov',
    role: 'CTO & Co-Founder',
    bio: 'Technical leader with expertise in building scalable platforms and AI/ML systems.',
    image: '/team/sherzod.jpg',
    initials: 'SN',
    linkedin: 'https://linkedin.com/in/sherzod-norkobilov',
  },
  {
    name: 'Sadrijakhon',
    role: 'VP of Product',
    bio: 'Product strategist focused on creating intuitive experiences for repair shop owners.',
    image: '/team/sadrijakhon.jpg',
    initials: 'SA',
    linkedin: 'https://linkedin.com/in/sadrijakhon',
  },
];

const advisors = [
  {
    name: 'David Chen',
    role: 'Industry Advisor',
    company: 'Former VP Operations, Penske Truck Leasing',
    initials: 'DC',
  },
  {
    name: 'Maria Santos',
    role: 'Technical Advisor',
    company: 'Engineering Director, Stripe',
    initials: 'MS',
  },
  {
    name: 'Robert Kim',
    role: 'Go-to-Market Advisor',
    company: 'Partner, Andreessen Horowitz',
    initials: 'RK',
  },
];

export function TeamSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium mb-4"
          >
            Our Team
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4"
          >
            Built by Industry Veterans
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            A passionate team building the future of shop management software.
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200">
                {/* Placeholder avatar with initials */}
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-neutral-600 to-neutral-800">
                  <span className="text-4xl font-bold text-white">{member.initials}</span>
                </div>

                {/* Hover overlay with social links */}
                <div className="absolute inset-0 bg-neutral-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-neutral-900">{member.name}</h3>
              <p className="text-sm text-neutral-600 font-medium mb-2">{member.role}</p>
              <p className="text-sm text-neutral-600">{member.bio}</p>
            </motion.div>
          ))}
        </div>

        {/* Advisors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-neutral-200 pt-12"
        >
          <h3 className="text-center text-sm font-medium text-neutral-500 uppercase tracking-wide mb-8">
            Backed by Industry Leaders
          </h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {advisors.map((advisor, index) => (
              <motion.div
                key={advisor.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-semibold text-neutral-600">{advisor.initials}</span>
                </div>
                <p className="font-medium text-neutral-900">{advisor.name}</p>
                <p className="text-sm text-neutral-500">{advisor.company}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Company Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 bg-neutral-50 rounded-2xl p-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900">2026</div>
            <div className="text-sm text-neutral-600">Founded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900">Cincinnati</div>
            <div className="text-sm text-neutral-600">Origin</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900">5</div>
            <div className="text-sm text-neutral-600">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900">San Francisco</div>
            <div className="text-sm text-neutral-600">Headquarters</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
