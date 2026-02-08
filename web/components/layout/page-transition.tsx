'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
  children: ReactNode;
  className?: string;
}

// Simple CSS-based fade-in using Tailwind's animate-in
export function FadeIn({ children, className }: FadeInProps) {
  return (
    <div className={cn('animate-in fade-in duration-200', className)}>
      {children}
    </div>
  );
}

// Simple CSS-based slide up animation
interface SlideUpProps {
  children: ReactNode;
  className?: string;
}

export function SlideUp({ children, className }: SlideUpProps) {
  return (
    <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-200', className)}>
      {children}
    </div>
  );
}

// Simple wrapper - no animation, just passes through
// Use this as a lightweight alternative when animations aren't needed
export function PageWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
