'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/investors', label: 'Investors' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300',
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-amber-500/20">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="font-bold text-xl text-neutral-900">ShopMule</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Button
                asChild
                className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl h-10 px-6 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-neutral-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-white border-b border-neutral-200 shadow-lg md:hidden"
          >
            <div className="px-6 py-6 space-y-6">
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) =>
                  link.href.startsWith('/') ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-base font-medium text-neutral-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-base font-medium text-neutral-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  )
                )}
              </nav>
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-3 text-sm font-medium text-neutral-700 hover:text-amber-600 border border-neutral-300 rounded-xl hover:bg-amber-50 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl h-12 text-base font-semibold"
                >
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
