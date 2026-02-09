'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutPage() {
  useEffect(() => {
    async function performSignOut() {
      // Clear any local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Call our custom logout API to clear cookies server-side
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch (e) {
        console.error('Logout API error:', e);
      }

      // Clear cookies client-side as well
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.includes('next-auth') || name.includes('session')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });

      // Perform NextAuth signout
      await signOut({
        callbackUrl: '/',
        redirect: true
      });
    }

    performSignOut();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <p className="text-neutral-600">Signing out...</p>
      </div>
    </div>
  );
}
