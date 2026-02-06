'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

interface Integration {
  name: string
  description: string
  logo: React.ReactNode
  features: string[]
  comingSoon?: boolean
}

const integrations: Integration[] = [
  {
    name: 'QuickBooks',
    description: 'Sync invoices, payments, and customer data automatically',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <circle cx="20" cy="20" r="20" fill="#2CA01C" />
        <path
          d="M12 20c0-4.4 3.6-8 8-8v4c-2.2 0-4 1.8-4 4s1.8 4 4 4v4c-4.4 0-8-3.6-8-8zm8-8v4c2.2 0 4 1.8 4 4h4c0-4.4-3.6-8-8-8zm4 8c0 2.2-1.8 4-4 4v4c4.4 0 8-3.6 8-8h-4z"
          fill="white"
        />
      </svg>
    ),
    features: ['Auto-sync invoices', 'Payment reconciliation', 'Customer sync'],
  },
  {
    name: 'Stripe',
    description: 'Accept credit cards and ACH payments seamlessly',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="8" fill="#635BFF" />
        <path
          d="M18.5 16.5c0-.83.68-1.17 1.8-1.17 1.6 0 3.63.49 5.23 1.36V12.2c-1.75-.7-3.48-1-5.23-1-4.27 0-7.1 2.23-7.1 5.96 0 5.8 8 4.88 8 7.38 0 .98-.85 1.3-2.05 1.3-1.77 0-4.03-.73-5.82-1.71v4.56c1.98.85 3.98 1.21 5.82 1.21 4.38 0 7.4-2.17 7.4-5.94-.01-6.27-8.05-5.15-8.05-7.46z"
          fill="white"
        />
      </svg>
    ),
    features: ['Credit card processing', 'ACH bank transfers', 'Payment links'],
  },
  {
    name: 'Twilio',
    description: 'Send SMS updates and reminders to customers',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="8" fill="#F22F46" />
        <circle cx="20" cy="20" r="12" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="15" cy="20" r="3" fill="white" />
        <circle cx="25" cy="20" r="3" fill="white" />
      </svg>
    ),
    features: ['SMS notifications', 'Appointment reminders', 'Status updates'],
  },
  {
    name: 'Google Calendar',
    description: 'Sync appointments and technician schedules',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="8" fill="#4285F4" />
        <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
        <rect x="10" y="10" width="20" height="6" fill="#EA4335" />
        <rect x="14" y="20" width="4" height="4" fill="#34A853" />
        <rect x="22" y="20" width="4" height="4" fill="#FBBC05" />
        <rect x="14" y="26" width="4" height="2" fill="#4285F4" />
      </svg>
    ),
    features: ['Calendar sync', 'Technician scheduling', 'Customer appointments'],
  },
  {
    name: 'FMCSA SAFER',
    description: 'Verify carrier credentials and compliance status',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="8" fill="#1a365d" />
        <path
          d="M10 15h20v2H10zm0 4h16v2H10zm0 4h20v2H10zm0 4h12v2H10z"
          fill="white"
        />
        <circle cx="28" cy="26" r="6" fill="#48bb78" />
        <path d="M25 26l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
    features: ['MC number lookup', 'DOT verification', 'Authority status'],
  },
  {
    name: 'Slack',
    description: 'Get real-time notifications in your team channels',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="8" fill="#4A154B" />
        <path d="M17 10a2 2 0 00-2 2v5h-3a2 2 0 100 4h3v5a2 2 0 104 0v-5h5v3a2 2 0 104 0v-3h3a2 2 0 100-4h-3v-5h3a2 2 0 100-4h-3v-3a2 2 0 10-4 0v3h-5v-3a2 2 0 00-2-2zm2 9v5h5v-5h-5z" fill="white" fillRule="evenodd" />
      </svg>
    ),
    features: ['Team notifications', 'Work order alerts', 'Daily summaries'],
    comingSoon: true,
  },
]

export function Integrations() {
  return (
    <section id="integrations" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Works with your favorite tools
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            ShopMule integrates seamlessly with the software you already use,
            so you can keep your existing workflows while gaining powerful new capabilities
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-neutral-50 rounded-xl p-6 border border-neutral-200 hover:border-amber-300 hover:shadow-lg transition-all ${
                integration.comingSoon ? 'opacity-75' : ''
              }`}
            >
              {integration.comingSoon && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                  Coming Soon
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">{integration.logo}</div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{integration.name}</h3>
                  <p className="text-sm text-neutral-600">{integration.description}</p>
                </div>
              </div>

              <ul className="space-y-2">
                {integration.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-neutral-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-600 mb-4">
            Don't see your tool? We're always adding new integrations.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            Request an integration
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
