import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ShopMule Privacy Policy - How we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Privacy Policy</h1>
        <p className="text-neutral-600 mb-8">Last updated: February 8, 2026</p>

        <div className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Introduction</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              ShopMule (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our auto body shop management software and related services.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              By using ShopMule, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, business name, and billing information</li>
              <li><strong>Customer Data:</strong> Information about your customers that you enter into the system</li>
              <li><strong>Vehicle Data:</strong> VIN numbers, make, model, year, and service history</li>
              <li><strong>Work Order Data:</strong> Repair descriptions, parts, labor, and pricing information</li>
              <li><strong>Employee Data:</strong> Names, contact information, and time tracking data</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
              <li><strong>Location Data:</strong> IP address and, if enabled, GPS location for time clock features</li>
              <li><strong>Cookies:</strong> Session and preference cookies for functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative notifications and updates</li>
              <li>Respond to customer service requests and support needs</li>
              <li>Monitor and analyze usage patterns to improve user experience</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li><strong>Service Providers:</strong> Third parties that help us operate our business (payment processors, hosting providers, email services)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you have given explicit permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Data Security</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee security training and background checks</li>
              <li>Secure data centers with physical security measures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Data Retention</h2>
            <p className="text-neutral-700 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. Upon account termination, we will delete or anonymize your data within 90 days, except where retention is required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Your Rights</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@shopmule.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Keep you signed in</li>
              <li>Remember your preferences</li>
              <li>Analyze site usage and performance</li>
              <li>Personalize your experience</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-neutral-700 leading-relaxed">
              ShopMule is not intended for children under 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. International Data Transfers</h2>
            <p className="text-neutral-700 leading-relaxed">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses approved by relevant authorities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-neutral-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our website. Your continued use of ShopMule after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">12. Contact Us</h2>
            <p className="text-neutral-700 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p className="text-neutral-700"><strong>ShopMule</strong></p>
              <p className="text-neutral-700">Email: privacy@shopmule.com</p>
              <p className="text-neutral-700">Address: 123 Main Street, Suite 100, City, ST 12345</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-neutral-600">
          <p>&copy; {new Date().getFullYear()} ShopMule. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/terms" className="hover:text-neutral-900">Terms of Service</Link>
            <Link href="/contact" className="hover:text-neutral-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
