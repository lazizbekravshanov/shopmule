import Link from "next/link"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LandingNav } from "@/components/landing/nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Clock, 
  Grid3x3, 
  Package, 
  Receipt, 
  Tv,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import { LandingHero } from "@/components/landing/hero"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ScreenshotsSection } from "@/components/landing/screenshots"
import { PricingSection } from "@/components/landing/pricing"
import { FAQSection } from "@/components/landing/faq"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "BodyShopper - Run your shop like software",
  description: "SaaS for trucking service centers. Manage repair orders, track technician time, handle parts inventory, and run your shop efficiently.",
  openGraph: {
    title: "BodyShopper - Run your shop like software",
    description: "SaaS for trucking service centers. Manage repair orders, track technician time, handle parts inventory, and run your shop efficiently.",
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
          <HowItWorks />
          <ScreenshotsSection />
          <PricingSection />
          <FAQSection />
        </div>

        {/* Final CTA */}
        <section className="bg-gray-50 border-t border-gray-200 mt-32 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to transform your shop?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join modern fleets and service centers running on BodyShopper.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/login">Get started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">BodyShopper</h3>
                <p className="text-sm text-gray-600">
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
