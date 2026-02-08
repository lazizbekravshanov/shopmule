import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ShopMule Terms of Service - Terms and conditions for using our platform.',
};

export default function TermsOfServicePage() {
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
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Terms of Service</h1>
        <p className="text-neutral-600 mb-8">Last updated: February 8, 2026</p>

        <div className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-700 leading-relaxed">
              By accessing or using ShopMule (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service. These Terms apply to all users, including administrators, employees, and any other individuals granted access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Description of Service</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              ShopMule provides cloud-based auto body shop management software, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Work order and repair order management</li>
              <li>Customer relationship management</li>
              <li>Vehicle tracking and history</li>
              <li>Invoicing and payment processing</li>
              <li>Employee time tracking</li>
              <li>Inventory management</li>
              <li>Reporting and analytics</li>
              <li>Customer portal</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Account Registration</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              To use ShopMule, you must:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Provide accurate, current, and complete registration information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              You must be at least 18 years old and have the legal authority to enter into these Terms on behalf of your business.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Subscription and Payment</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">4.1 Pricing</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              ShopMule offers various subscription plans. Prices are subject to change with 30 days&apos; notice. Current pricing is available on our website.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">4.2 Billing</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>You authorize us to charge your payment method automatically</li>
              <li>Failed payments may result in service suspension</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">4.3 Free Trial</h3>
            <p className="text-neutral-700 leading-relaxed">
              If you sign up for a free trial, you may use the Service without charge during the trial period. At the end of the trial, your account will be converted to a paid subscription unless you cancel.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Acceptable Use</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Collect user data without consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Your Data</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">6.1 Ownership</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              You retain all rights to your data. By using ShopMule, you grant us a license to host, store, and process your data solely to provide the Service.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">6.2 Data Backup</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              While we maintain regular backups, you are responsible for maintaining your own backups of critical data.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">6.3 Data Export</h3>
            <p className="text-neutral-700 leading-relaxed">
              You may export your data at any time through the Service. Upon account termination, you will have 30 days to export your data before it is deleted.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Intellectual Property</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              ShopMule and its licensors own all rights to the Service, including:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Software, code, and technology</li>
              <li>Trademarks, logos, and branding</li>
              <li>Documentation and content</li>
              <li>User interface designs</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              You may not copy, modify, distribute, or reverse engineer any part of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Third-Party Services</h2>
            <p className="text-neutral-700 leading-relaxed">
              ShopMule integrates with third-party services (payment processors, email providers, etc.). Your use of these services is subject to their respective terms and privacy policies. We are not responsible for third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Service Availability</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We may:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Perform scheduled maintenance with advance notice</li>
              <li>Make emergency changes to protect the Service</li>
              <li>Modify or discontinue features with reasonable notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND</li>
              <li>WE DISCLAIM ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES</li>
              <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID IN THE PRECEDING 12 MONTHS</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">11. Indemnification</h2>
            <p className="text-neutral-700 leading-relaxed">
              You agree to indemnify and hold harmless ShopMule, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of any rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">12. Termination</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Either party may terminate this agreement:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>We may suspend or terminate your account for violation of these Terms</li>
              <li>We may terminate with 30 days&apos; notice for any reason</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Upon termination, your right to use the Service ceases immediately. Sections regarding liability, indemnification, and dispute resolution survive termination.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">13. Dispute Resolution</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Any disputes arising from these Terms shall be resolved through:
            </p>
            <ol className="list-decimal pl-6 text-neutral-700 space-y-2">
              <li><strong>Informal Resolution:</strong> Contact us first to attempt to resolve the dispute</li>
              <li><strong>Arbitration:</strong> If informal resolution fails, disputes shall be resolved by binding arbitration</li>
              <li><strong>Jurisdiction:</strong> These Terms are governed by the laws of the State of Delaware</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">14. Changes to Terms</h2>
            <p className="text-neutral-700 leading-relaxed">
              We may modify these Terms at any time. We will notify you of material changes via email or through the Service. Continued use after changes constitutes acceptance. If you disagree with changes, you must stop using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">15. General Provisions</h2>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and ShopMule</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, other provisions remain in effect</li>
              <li><strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver</li>
              <li><strong>Assignment:</strong> You may not assign these Terms without our consent</li>
              <li><strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">16. Contact Information</h2>
            <p className="text-neutral-700 leading-relaxed">
              For questions about these Terms, please contact us:
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p className="text-neutral-700"><strong>ShopMule</strong></p>
              <p className="text-neutral-700">Email: legal@shopmule.com</p>
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
            <Link href="/privacy" className="hover:text-neutral-900">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-neutral-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
