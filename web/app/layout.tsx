import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';
import { GoogleAnalytics, Hotjar } from '@/components/analytics';
import { CrispChat } from '@/components/chat';
import { SkipLink } from '@/components/accessibility';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopmuleai.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ShopMule - AI-Powered Auto Body Shop Management Software',
    template: '%s | ShopMule',
  },
  description:
    'AI-powered work orders, invoicing, customer portal, time tracking, and inventory management for auto body and truck repair shops.',
  keywords: [
    'auto body shop software',
    'body shop management',
    'collision repair software',
    'auto repair shop software',
    'work order management',
    'shop management system',
    'automotive software',
    'repair order software',
    'body shop invoicing',
    'customer portal',
    'time clock',
    'inventory management',
  ],
  authors: [{ name: 'ShopMule', url: siteUrl }],
  creator: 'ShopMule',
  publisher: 'ShopMule',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'ShopMule',
    title: 'ShopMule - AI-Powered Auto Body Shop Management Software',
    description:
      'Streamline your auto body shop with ShopMule. AI-powered work orders, invoicing, customer portal, time tracking, and inventory management.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ShopMule - Auto Body Shop Management Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopMule - AI-Powered Auto Body Shop Management',
    description:
      'Streamline your auto body shop operations. Work orders, invoicing, customer portal, and more.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@shopmule',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#18181b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://js.stripe.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'ShopMule',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'AI-powered auto body shop management software for work orders, invoicing, customer portal, time tracking, and inventory management.',
              url: siteUrl,
              offers: {
                '@type': 'Offer',
                price: '149',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
              },
              author: {
                '@type': 'Organization',
                name: 'ShopMule',
                url: siteUrl,
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ShopMule',
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              sameAs: [
                'https://twitter.com/shopmule',
                'https://linkedin.com/company/shopmule',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-123-4567',
                contactType: 'sales',
                availableLanguage: 'English',
              },
            }),
          }}
        />
      </head>
      <body>
        <SkipLink />
        <GoogleAnalytics />
        <Hotjar />
        <CrispChat />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
