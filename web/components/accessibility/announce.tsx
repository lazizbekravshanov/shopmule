'use client';

import { useEffect, useState } from 'react';

interface AnnounceProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

// Component for screen reader announcements
export function Announce({ message, politeness = 'polite' }: AnnounceProps) {
  const [announced, setAnnounced] = useState('');

  useEffect(() => {
    // Clear and re-announce to ensure screen readers pick it up
    setAnnounced('');
    const timeout = setTimeout(() => setAnnounced(message), 100);
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announced}
    </div>
  );
}

// Hook for programmatic announcements
export function useAnnounce() {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState(0);

  const announce = (text: string) => {
    setMessage(text);
    setKey((k) => k + 1);
  };

  const Announcer = () => (
    <div
      key={key}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );

  return { announce, Announcer };
}
