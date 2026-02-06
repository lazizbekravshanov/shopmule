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
  BlogPreview,
  StatsCounter,
  ROICalculator,
  Integrations,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <SocialProof />
        <BlogPreview />
        <StatsCounter />
        <ProblemSolution />
        <FeaturesBento />
        <Integrations />
        <HowItWorks />
        <ROICalculator />
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
