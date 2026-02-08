'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

export function CrispChat() {
  useEffect(() => {
    // Initialize Crisp
    if (CRISP_WEBSITE_ID && typeof window !== 'undefined') {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;
    }
  }, []);

  if (!CRISP_WEBSITE_ID) {
    return null;
  }

  return (
    <Script
      id="crisp-chat"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.$crisp=[];
          window.CRISP_WEBSITE_ID="${CRISP_WEBSITE_ID}";
          (function(){
            var d=document;
            var s=d.createElement("script");
            s.src="https://client.crisp.chat/l.js";
            s.async=1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `,
      }}
    />
  );
}

// Crisp helper functions
export const crisp = {
  // Open chat
  open: () => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'chat:open']);
    }
  },

  // Close chat
  close: () => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'chat:close']);
    }
  },

  // Show chat
  show: () => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'chat:show']);
    }
  },

  // Hide chat
  hide: () => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'chat:hide']);
    }
  },

  // Set user email
  setEmail: (email: string) => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['set', 'user:email', email]);
    }
  },

  // Set user name
  setName: (name: string) => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['set', 'user:nickname', name]);
    }
  },

  // Set user company
  setCompany: (company: string) => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['set', 'user:company', company]);
    }
  },

  // Set custom data
  setData: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['set', 'session:data', [[key, value]]]);
    }
  },

  // Send message
  sendMessage: (message: string) => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'message:send', ['text', message]]);
    }
  },

  // Trigger event
  trigger: (event: string) => {
    if (typeof window !== 'undefined' && window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'trigger:run', event]);
    }
  },
};
