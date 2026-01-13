import Link from "next/link"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LandingNav } from "@/components/landing/nav"
import { LandingHero } from "@/components/landing/hero"
import { StatsSection } from "@/components/landing/stats"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { WhyDifferent } from "@/components/landing/why-different"
import { HowItWorks } from "@/components/landing/how-it-works"
import { PricingSection } from "@/components/landing/pricing"
import { FAQSection } from "@/components/landing/faq"
import { FinalCTA } from "@/components/landing/final-cta"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "BodyShopper - Run your shop like software",
  description: "Modern SaaS for trucking service centers. Streamline repair orders, track technician time, handle parts inventory, and run your shop with precision.",
  openGraph: {
    title: "BodyShopper - Run your shop like software",
    description: "Modern SaaS for trucking service centers. Streamline repair orders, track technician time, handle parts inventory, and run your shop with precision.",
    type: "website",
  },
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/dashboard")
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <LandingNav />
        <LandingHero />
        <StatsSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureGrid />
          <WhyDifferent />
          <HowItWorks />
          <PricingSection />
          <FAQSection />
        </div>
        <FinalCTA />

        {/* Footer */}
        <footer className="border-t border-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">BodyShopper</h3>
                <p className="text-sm text-gray-600 font-light">
                  Run your shop like software.
                </p>
              </div>
              <div className="flex gap-8 text-sm text-gray-600 font-light">
                <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
                <Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
                <Link href="#faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500 font-light">
              <p>&copy; {new Date().getFullYear()} BodyShopper. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </>
  )
}
