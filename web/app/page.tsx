'use client';

import {
  Navigation,
  Hero,
  SocialProof,
  ProblemSolution,
  FeaturesBento,
  HowItWorks,
  PricingSection,
  FAQSection,
  FinalCTA,
  Footer,
  ScrollProgress,
  BuiltForTrucking,
  MobileShowcase,
  ROICalculator,
  SecuritySection,
  BackToTop,
  SmoothScroll,
} from '@/components/landing';
import { FounderStory } from '@/components/landing/testimonials';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white bg-dot-grid">
      <Navigation />
      <ScrollProgress />
      <main id="main-content" role="main">
        <Hero />
        <SocialProof />
        <ProblemSolution />
        <BuiltForTrucking />
        <FeaturesBento />
        <MobileShowcase />
        <HowItWorks />
        <ROICalculator />
        <PricingSection />
        <FounderStory />
        <SecuritySection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
      <BackToTop />
      <SmoothScroll />
    </div>
  );
}
