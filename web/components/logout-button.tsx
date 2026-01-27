'use client';

import { LogOut } from 'lucide-react';
import { logger } from '@/lib/logger';

export function LogoutButton() {
  const handleLogout = async () => {
    logger.info('User initiating logout');

    try {
      // Call our custom logout endpoint
      await fetch('/api/logout', { method: 'POST' });

      // Clear any client-side storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      logger.info('Logout successful, redirecting...');

      // Force hard redirect to home page
      window.location.href = '/';
    } catch (error) {
      logger.error('Logout failed', error);
      // Fallback: still try to redirect
      window.location.href = '/';
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </button>
  );
}
