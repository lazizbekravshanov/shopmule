'use client';

import { Shield, Lock, Server, Eye, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const complianceBadges = [
  {
    name: 'ISO 27001',
    subtitle: 'Information Security',
    description: 'Certified information security management system',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" className="text-blue-400" />
        <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="1.5" className="text-blue-400/60" />
        <path d="M17 24l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400" />
      </svg>
    ),
  },
  {
    name: 'SOC 2 Type II',
    subtitle: 'AICPA',
    description: 'Audited trust service criteria for security & availability',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" className="text-green-400" />
        <path d="M4 16h40" stroke="currentColor" strokeWidth="2" className="text-green-400/60" />
        <path d="M15 26l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400" />
      </svg>
    ),
  },
  {
    name: 'CSA STAR',
    subtitle: 'Cloud Security',
    description: 'Cloud Security Alliance STAR certified',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <path d="M24 4l5.5 11.5L42 17l-9 8.5L35 38 24 32l-11 6 2-12.5L6 17l12.5-1.5L24 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-amber-400" />
        <circle cx="24" cy="22" r="6" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60" />
      </svg>
    ),
  },
  {
    name: 'GDPR',
    subtitle: 'Data Privacy',
    description: 'Full compliance with EU data protection regulations',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" className="text-purple-400" />
        <path d="M24 12v8m0 0l-6 4m6-4l6 4m-6 8v-8m0 0l-6-4m6 4l6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-purple-400/60" />
        <circle cx="24" cy="24" r="4" fill="currentColor" className="text-purple-400" />
      </svg>
    ),
  },
  {
    name: 'NIST',
    subtitle: 'Cybersecurity Framework',
    description: 'Aligned with NIST CSF for risk management',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" className="text-cyan-400" />
        <path d="M8 20h32M16 20v16M24 20v16M32 20v16" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400/60" />
        <rect x="12" y="6" width="24" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400" />
      </svg>
    ),
  },
  {
    name: 'PCI DSS',
    subtitle: 'Payment Security',
    description: 'Payment Card Industry Data Security Standard compliant',
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect x="6" y="14" width="36" height="22" rx="3" stroke="currentColor" strokeWidth="2" className="text-emerald-400" />
        <path d="M6 22h36" stroke="currentColor" strokeWidth="3" className="text-emerald-400/60" />
        <rect x="10" y="28" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
        <circle cx="36" cy="30" r="3" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
      </svg>
    ),
  },
];

const securityFeatures = [
  {
    icon: Shield,
    title: 'SOC 2 Type II',
    description: 'Audited security controls',
  },
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    description: 'Data encrypted at rest & transit',
  },
  {
    icon: Server,
    title: '99.9% Uptime SLA',
    description: 'Enterprise reliability',
  },
  {
    icon: Eye,
    title: 'GDPR Compliant',
    description: 'Privacy by design',
  },
];

const securityChecklist = [
  'End-to-end TLS 1.3 encryption',
  'Multi-factor authentication (MFA)',
  'Role-based access control (RBAC)',
  'Automated security scanning',
  'Regular penetration testing',
  'Secure backup & disaster recovery',
];

export function SecuritySection() {
  return (
    <section className="py-20 bg-neutral-900">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Enterprise Security</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your data is protected
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Built with security-first architecture. We use industry-leading practices
            to keep your shop data safe and compliant.
          </p>
        </div>

        {/* Compliance Badges Row */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest text-neutral-500 text-center mb-8 font-medium">
            Certifications & Compliance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {complianceBadges.map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-5 text-center hover:border-neutral-600 hover:bg-neutral-800/70 transition-all cursor-default"
              >
                <div className="flex justify-center mb-3">
                  {badge.icon}
                </div>
                <h4 className="text-sm font-bold text-white leading-tight">{badge.name}</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">{badge.subtitle}</p>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {badge.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 text-center hover:border-neutral-600 transition-colors"
            >
              <div className="w-12 h-12 bg-neutral-700/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-neutral-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Security Details */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Checklist */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">
              Security measures we implement
            </h3>
            <ul className="space-y-4">
              {securityChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Trust indicators */}
          <div className="bg-neutral-800/30 border border-neutral-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">SSL/TLS Secured</h4>
                <p className="text-sm text-neutral-400">256-bit encryption</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-3 border-b border-neutral-700">
                <span className="text-neutral-400">Infrastructure</span>
                <span className="text-white font-medium">AWS / Vercel</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-700">
                <span className="text-neutral-400">Database</span>
                <span className="text-white font-medium">PostgreSQL (Encrypted)</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-700">
                <span className="text-neutral-400">Authentication</span>
                <span className="text-white font-medium">OAuth 2.0 / JWT</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-neutral-400">Compliance</span>
                <span className="text-white font-medium">SOC 2, GDPR, CCPA</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-700">
              <p className="text-xs text-neutral-500 text-center">
                Last security audit: January 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
