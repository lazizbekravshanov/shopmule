'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MuleIcon } from '@/components/ui/mule-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Register
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: shopName.trim(),
          ownerName: ownerName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const firstError = Object.values(data.details).flat()[0];
          setError(String(firstError) || data.error);
        } else {
          setError(data.error || 'Registration failed');
        }
        return;
      }

      // Step 2: Auto-login
      const signInResult = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account created but auto-login failed — redirect to login
        router.push('/login');
        return;
      }

      // Step 3: Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white bg-dot-grid flex">
      {/* Left Panel — brand showcase (desktop only) */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-20">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <MuleIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-900">ShopMule</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Get your shop
            <br />
            online{' '}
            <span className="relative inline-block">
              today.
              <span className="absolute -bottom-2 left-0 right-0 h-[5px] bg-[#ee7a14] rounded-full" />
            </span>
          </h1>

          <p className="mt-6 text-lg text-neutral-500 max-w-md leading-relaxed">
            Create your account in under a minute. Start tracking work orders, invoices, and customers right away.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-3 text-neutral-600">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm">14-day free trial, no credit card required</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-600">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm">Unlimited work orders from day one</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-600">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm">Cancel anytime, no questions asked</span>
          </div>
        </div>
      </motion.div>

      {/* Right Panel — registration form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12"
      >
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-2.5 mb-12 lg:mb-16 justify-center lg:justify-start"
          >
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <MuleIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-900 lg:hidden">ShopMule</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mb-8 text-center lg:text-left"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Get started with ShopMule in under a minute
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="shopName" className="text-sm font-medium text-neutral-700">
                Shop Name
              </Label>
              <Input
                id="shopName"
                type="text"
                placeholder="Acme Truck Repair"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="h-11 bg-white border-neutral-200 focus:ring-2 focus:ring-[#ee7a14]/30 focus:border-[#ee7a14]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName" className="text-sm font-medium text-neutral-700">
                Your Name
              </Label>
              <Input
                id="ownerName"
                type="text"
                placeholder="John Smith"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="h-11 bg-white border-neutral-200 focus:ring-2 focus:ring-[#ee7a14]/30 focus:border-[#ee7a14]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-white border-neutral-200 focus:ring-2 focus:ring-[#ee7a14]/30 focus:border-[#ee7a14]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 chars, upper + lower + digit"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white border-neutral-200 focus:ring-2 focus:ring-[#ee7a14]/30 focus:border-[#ee7a14]"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-neutral-700">
                Phone <span className="text-neutral-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 bg-white border-neutral-200 focus:ring-2 focus:ring-[#ee7a14]/30 focus:border-[#ee7a14]"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-8 text-center lg:text-left text-sm text-neutral-500"
          >
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[#ee7a14] hover:text-[#d56c10] transition-colors"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
