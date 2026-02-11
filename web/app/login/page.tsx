'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { MuleIcon } from '@/components/ui/mule-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: trimmedEmail,
        password: trimmedPassword,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
            <MuleIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">ShopMule</span>
        </Link>

        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
            Run your shop
            <br />
            <span className="text-orange-400">with precision.</span>
          </h1>
          <p className="mt-4 text-neutral-400 max-w-sm">
            Work orders. Time tracking. Invoicing.
            Everything you need, nothing you don&apos;t.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} ShopMule
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
              <MuleIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-900">ShopMule</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-neutral-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-neutral-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
