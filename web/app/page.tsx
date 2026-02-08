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
  ScrollProgress,
  BackToTop,
  SmoothScroll,
  VideoDemo,
  ExitIntentPopup,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <SmoothScroll />
      <Navigation />
      <main id="main-content" role="main">
        <Hero />
        <SocialProof />
        <BlogPreview />
        <StatsCounter />
        <ProblemSolution />
        <FeaturesBento />
        <VideoDemo />
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
      <BackToTop />
      <ExitIntentPopup />
    </div>
  );
}
