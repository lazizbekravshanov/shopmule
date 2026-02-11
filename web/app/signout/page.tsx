'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function SignOutPage() {
  const [status, setStatus] = useState<'signing-out' | 'clearing' | 'done'>('signing-out');

  useEffect(() => {
    async function performSignOut() {
      try {
        // Step 1: Clear local storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }

        setStatus('clearing');

        // Step 2: Clear all cookies client-side
        const cookiesToClear = [
          'next-auth.session-token',
          '__Secure-next-auth.session-token',
          'next-auth.callback-url',
          '__Secure-next-auth.callback-url',
          'next-auth.csrf-token',
          '__Secure-next-auth.csrf-token',
        ];

        cookiesToClear.forEach(name => {
          // Clear with all possible path/domain combinations
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
        });

        // Step 3: Call server-side logout to clear cookies
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
        });

        setStatus('done');

        // Step 4: Perform NextAuth signout and redirect
        // Using redirect: false first to ensure cookies are cleared
        await signOut({
          redirect: false,
        });

        // Step 5: Force a hard navigation to clear any cached state
        window.location.href = '/';
      } catch (e) {
        console.error('Signout error:', e);
        // Even if there's an error, redirect to home
        window.location.href = '/';
      }
    }

    performSignOut();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">
          {status === 'signing-out' && 'Signing out...'}
          {status === 'clearing' && 'Clearing session...'}
          {status === 'done' && 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
