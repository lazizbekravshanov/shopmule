'use client';

import {
  Navigation,
  Hero,
  SocialProof,
  ProblemSolution,
  FeaturesBento,
  HowItWorks,
  PricingSection,
  Testimonials,
  FAQSection,
  SecuritySection,
  StatusSection,
  FinalCTA,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <SocialProof />
        <ProblemSolution />
        <FeaturesBento />
        <HowItWorks />
        <Testimonials />
        <PricingSection />
        <SecuritySection />
        <FAQSection />
        <StatusSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
