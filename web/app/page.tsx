import Link from "next/link"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LandingNav } from "@/components/landing/nav"
import { LandingHero } from "@/components/landing/hero"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { WhyDifferent } from "@/components/landing/why-different"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ScreenshotsSection } from "@/components/landing/screenshots"
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureGrid />
          <WhyDifferent />
          <ScreenshotsSection />
          <HowItWorks />
          <PricingSection />
          <FAQSection />
        </div>

        <FinalCTA />

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">BodyShopper</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Run your shop like software.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Product</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
                  <li><Link href="#faq" className="hover:text-gray-900 transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Company</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="#" className="hover:text-gray-900 transition-colors">About</Link></li>
                  <li><Link href="#" className="hover:text-gray-900 transition-colors">Contact</Link></li>
                  <li><Link href="#" className="hover:text-gray-900 transition-colors">Support</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="#" className="hover:text-gray-900 transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-gray-900 transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
              <p>&copy; {new Date().getFullYear()} BodyShopper. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </>
  )
}
