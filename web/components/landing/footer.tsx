'use client';

import Link from 'next/link';
import { MuleIcon } from '@/components/ui/mule-logo';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How It Works', href: '#how-it-works' },
  ],
  company: [
    { label: 'About', href: '/investors' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '#contact' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Apple-style: Clean grid with generous spacing */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                <MuleIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-neutral-900">ShopMule</span>
            </Link>
            <p className="mt-4 text-neutral-500 leading-relaxed max-w-xs">
              AI-powered shop management for repair shops that mean business.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-5">Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-500 hover:text-neutral-900 transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-5">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-500 hover:text-neutral-900 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-5">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-500 hover:text-neutral-900 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Apple style: minimal, centered */}
        <div className="mt-16 pt-8 border-t border-neutral-100 text-center">
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} ShopMule. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
