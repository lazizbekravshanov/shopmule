'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Analytics event helper
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
    (window as unknown as { gtag: Function }).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Conversion tracking helpers
export const analytics = {
  // Track demo request
  trackDemoRequest: (source?: string) => {
    trackEvent('demo_request', 'conversion', source);
    // Also send as GA4 conversion
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag('event', 'conversion', {
        send_to: `${GA_MEASUREMENT_ID}/demo_request`,
      });
    }
  },

  // Track signup
  trackSignup: (plan?: string) => {
    trackEvent('sign_up', 'conversion', plan);
  },

  // Track pricing view
  trackPricingView: () => {
    trackEvent('view_pricing', 'engagement');
  },

  // Track CTA click
  trackCTAClick: (ctaName: string, location: string) => {
    trackEvent('cta_click', 'engagement', `${ctaName}_${location}`);
  },

  // Track video play
  trackVideoPlay: (videoName: string) => {
    trackEvent('video_play', 'engagement', videoName);
  },

  // Track scroll depth
  trackScrollDepth: (percentage: number) => {
    trackEvent('scroll_depth', 'engagement', `${percentage}%`);
  },

  // Track feature interest
  trackFeatureInterest: (featureName: string) => {
    trackEvent('feature_interest', 'engagement', featureName);
  },

  // Track exit intent
  trackExitIntent: (converted: boolean) => {
    trackEvent('exit_intent', 'engagement', converted ? 'converted' : 'dismissed');
  },

  // Track page timing
  trackPageTiming: (pageName: string, loadTime: number) => {
    trackEvent('page_timing', 'performance', pageName, loadTime);
  },
};
