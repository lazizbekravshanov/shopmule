'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/stores/ui-store';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { setCommandOpen, setShortcutsOpen } = useUIStore();

  const shortcuts: ShortcutConfig[] = [
    // Navigation
    { key: 'g', description: 'Go to Dashboard', action: () => router.push('/dashboard') },
    { key: 'w', alt: true, description: 'Go to Work Orders', action: () => router.push('/work-orders') },
    { key: 'c', alt: true, description: 'Go to Customers', action: () => router.push('/customers') },
    { key: 'i', alt: true, description: 'Go to Invoices', action: () => router.push('/invoices') },
    { key: 'p', alt: true, description: 'Go to Inventory', action: () => router.push('/inventory') },
    { key: 't', alt: true, description: 'Go to Technicians', action: () => router.push('/technicians') },
    { key: 'r', alt: true, description: 'Go to Reports', action: () => router.push('/reports') },

    // Quick actions (with Shift)
    { key: 'n', meta: true, shift: true, description: 'New Work Order', action: () => router.push('/work-orders/new') },
    { key: 'c', meta: true, shift: true, description: 'New Customer', action: () => router.push('/customers/new') },

    // Search (Cmd+K is handled by command palette itself)
    { key: '/', description: 'Open search', action: () => setCommandOpen(true) },

    // Help
    { key: '?', shift: true, description: 'Show keyboard shortcuts', action: () => setShortcutsOpen(true) },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const metaMatch = shortcut.meta ? (event.metaKey || event.ctrlKey) : !(event.metaKey || event.ctrlKey);
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey || shortcut.meta;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (keyMatch && metaMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

export function getShortcutDisplay(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('⇧');
  if (shortcut.alt) parts.push('⌥');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}
