'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ArrowRight, CheckCircle } from 'lucide-react';
import { analytics } from '@/components/analytics';

const STORAGE_KEY = 'shopmule_exit_popup_shown';
const POPUP_DELAY = 5000; // Don't show for first 5 seconds

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const showPopup = useCallback(() => {
    // Check if already shown in this session
    const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
    if (alreadyShown) return;

    // Mark as shown
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(true);
    analytics.trackExitIntent(false);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let canShow = false;

    // Wait before allowing popup
    timeoutId = setTimeout(() => {
      canShow = true;
    }, POPUP_DELAY);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves through top of viewport
      if (e.clientY <= 0 && canShow) {
        showPopup();
      }
    };

    // Mobile: detect back button or scroll up quickly
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (!canShow) return;

      const currentScrollY = window.scrollY;
      // If user scrolls up rapidly from below
      if (currentScrollY < lastScrollY - 100 && lastScrollY > 500) {
        showPopup();
      }
      lastScrollY = currentScrollY;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showPopup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Exit Intent',
          lastName: 'Lead',
          email,
          source: 'exit_intent_popup',
          message: 'Captured via exit intent popup - offered 20% discount',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setIsSubmitted(true);
      analytics.trackExitIntent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors z-10"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>

            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-10 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Wait! Don&apos;t Miss Out
                  </h2>
                  <p className="text-orange-100">
                    Get 20% off your first 3 months
                  </p>
                </div>

                {/* Content */}
                <div className="px-8 py-8">
                  <p className="text-neutral-600 text-center mb-6">
                    Join 500+ auto body shops already using ShopMule to streamline their operations. Enter your email to claim your exclusive discount.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        'Claiming...'
                      ) : (
                        <>
                          Claim My 20% Discount
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-neutral-500 text-center mt-4">
                    No spam. Unsubscribe anytime. By signing up, you agree to our{' '}
                    <a href="/privacy" className="underline">Privacy Policy</a>.
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="px-8 pb-6">
                  <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No credit card
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      14-day free trial
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="px-8 py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  You&apos;re All Set!
                </h2>
                <p className="text-neutral-600 mb-6">
                  Check your email for your exclusive 20% discount code. We&apos;ll also send you a link to start your free trial.
                </p>
                <button
                  onClick={handleClose}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Got It!
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
