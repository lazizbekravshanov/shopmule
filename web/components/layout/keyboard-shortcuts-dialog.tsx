'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUIStore } from '@/lib/stores/ui-store';

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['G'], description: 'Go to Dashboard' },
    { keys: ['⌥', 'W'], description: 'Go to Work Orders' },
    { keys: ['⌥', 'C'], description: 'Go to Customers' },
    { keys: ['⌥', 'I'], description: 'Go to Invoices' },
    { keys: ['⌥', 'P'], description: 'Go to Inventory' },
    { keys: ['⌥', 'T'], description: 'Go to Technicians' },
    { keys: ['⌥', 'R'], description: 'Go to Reports' },
  ]},
  { category: 'Quick Actions', items: [
    { keys: ['⌘', '⇧', 'N'], description: 'New Work Order' },
    { keys: ['⌘', '⇧', 'C'], description: 'New Customer' },
  ]},
  { category: 'General', items: [
    { keys: ['⌘', 'K'], description: 'Open search' },
    { keys: ['/'], description: 'Open search' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Close dialog' },
  ]},
];

export function KeyboardShortcutsDialog() {
  const { shortcutsOpen, setShortcutsOpen } = useUIStore();

  return (
    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                {section.category}
              </h3>
              <div className="space-y-1">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
