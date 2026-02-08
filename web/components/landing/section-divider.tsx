'use client';

import { cn } from '@/lib/utils';

interface SectionDividerProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export function SectionDivider({ className, variant = 'light' }: SectionDividerProps) {
  return (
    <div
      className={cn(
        'h-px w-full',
        variant === 'light'
          ? 'bg-gradient-to-r from-transparent via-neutral-200 to-transparent'
          : 'bg-gradient-to-r from-transparent via-neutral-300 to-transparent',
        className
      )}
    />
  );
}

export function SectionGradient({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-24 w-full bg-gradient-to-b from-transparent to-neutral-50/50',
        className
      )}
    />
  );
}
