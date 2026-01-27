'use client';

import { cn } from '@/lib/utils';

interface MuleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MuleLogo({ className, size = 'md' }: MuleLogoProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn(sizeClasses[size], className)}
      aria-hidden="true"
    >
      {/* Mule head silhouette */}
      <path d="M19.5 8.5c0-1.5-1-2.5-2-3l-1-3.5c-.2-.7-.8-1-1.5-1h-1c-.7 0-1.3.3-1.5 1l-.5 2c-1.5.2-3 1-4 2.5L6 8c-1.5.5-2.5 2-2.5 3.5v4c0 1.5 1 3 2.5 3.5l1 .5v2c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5v-1h4v1c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5v-2l1-.5c1.5-.5 2.5-2 2.5-3.5v-4c0-.5-.1-1-.2-1.5zM7 13c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm2.5-5c.8 0 1.5.7 1.5 1.5S10.3 11 9.5 11 8 10.3 8 9.5 8.7 8 9.5 8zM12 16H8v-1h4v1zm5-3c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
      {/* Ears */}
      <path d="M6 4l-2 3c-.3.4-.2.9.2 1.2.4.3.9.2 1.2-.2l2-3c.3-.4.2-.9-.2-1.2-.4-.3-.9-.2-1.2.2z" />
      <path d="M18 4l2 3c.3.4.2.9-.2 1.2-.4.3-.9.2-1.2-.2l-2-3c-.3-.4-.2-.9.2-1.2.4-.3.9-.2 1.2.2z" />
    </svg>
  );
}

// Icon version for use in icon contexts (matches lucide-react pattern)
export function MuleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Simplified mule head outline */}
      <ellipse cx="12" cy="13" rx="7" ry="6" />
      {/* Snout */}
      <ellipse cx="12" cy="17" rx="3" ry="2" />
      {/* Left ear */}
      <path d="M7 7l-2-4" />
      <path d="M5 3l2 1" />
      {/* Right ear */}
      <path d="M17 7l2-4" />
      <path d="M19 3l-2 1" />
      {/* Eyes */}
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
      {/* Nostrils */}
      <circle cx="10.5" cy="17" r="0.5" fill="currentColor" />
      <circle cx="13.5" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}
