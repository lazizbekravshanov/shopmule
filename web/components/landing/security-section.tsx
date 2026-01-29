'use client';

import { Shield, Lock, Server, Eye, CheckCircle2 } from 'lucide-react';

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

        {/* Security Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {securityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 text-center hover:border-neutral-600 transition-colors"
            >
              <div className="w-12 h-12 bg-neutral-700/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-neutral-400">{feature.description}</p>
            </div>
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
