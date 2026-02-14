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
  MetricsBanner,
  CaseStudies,
  MarketOpportunity,
  TeamSection,
  CompetitorComparison,
  MobileShowcase,
  BuiltForTrucking,
  AnnouncementBar,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <SmoothScroll />
      <AnnouncementBar />
      <Navigation />
      <main id="main-content" role="main">
        <Hero />
        <MetricsBanner />
        <SocialProof />
        <BlogPreview />
        <StatsCounter />
        <ProblemSolution />
        <FeaturesBento />
        <MobileShowcase />
        <BuiltForTrucking />
        <VideoDemo />
        <Integrations />
        <HowItWorks />
        <ROICalculator />
        <Testimonials />
        <CaseStudies />
        <CompetitorComparison />
        <PricingSection />
        <TeamSection />
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
