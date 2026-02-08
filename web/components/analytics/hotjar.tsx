'use client';

import Script from 'next/script';

const CONTENTSQUARE_ID = process.env.NEXT_PUBLIC_CONTENTSQUARE_ID;

export function Hotjar() {
  if (!CONTENTSQUARE_ID) {
    return null;
  }

  return (
    <Script
      src={`https://t.contentsquare.net/uxa/${CONTENTSQUARE_ID}.js`}
      strategy="afterInteractive"
    />
  );
}

// Contentsquare/Hotjar event helpers
export const hotjar = {
  // Trigger a custom event
  trigger: (eventName: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { _uxa?: unknown[] })._uxa) {
      (window as unknown as { _uxa: unknown[] })._uxa.push(['trackDynamicVariable', { key: 'event', value: eventName }]);
    }
  },

  // Track page view
  trackPageView: (pageName: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { _uxa?: unknown[] })._uxa) {
      (window as unknown as { _uxa: unknown[] })._uxa.push(['trackPageview', pageName]);
    }
  },
};
