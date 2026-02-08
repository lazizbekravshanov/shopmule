'use client';

import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog';

export function KeyboardShortcutsProvider() {
  useKeyboardShortcuts();
  return <KeyboardShortcutsDialog />;
}
