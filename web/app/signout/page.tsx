'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutPage() {
  useEffect(() => {
    // Clear any local storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Perform signout
    signOut({
      callbackUrl: '/',
      redirect: true
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <p className="text-neutral-600">Signing out...</p>
      </div>
    </div>
  );
}
