import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "BodyShopper - Run your shop like software",
    template: "%s | BodyShopper",
  },
  description:
    "Modern SaaS for trucking service centers. Streamline repair orders, track technician time, handle parts inventory, and run your shop with precision.",
  keywords: [
    "trucking",
    "service center",
    "repair orders",
    "shop management",
    "time tracking",
    "inventory management",
  ],
  authors: [{ name: "BodyShopper" }],
  creator: "BodyShopper",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BodyShopper",
    title: "BodyShopper - Run your shop like software",
    description:
      "Modern SaaS for trucking service centers. Streamline repair orders, track technician time, handle parts inventory, and run your shop with precision.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BodyShopper - Run your shop like software",
    description:
      "Modern SaaS for trucking service centers. Streamline repair orders, track technician time, handle parts inventory, and run your shop with precision.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
