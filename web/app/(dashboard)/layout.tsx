import { AppShell } from '@/components/layout/app-shell';
import { AICopilotLoader } from '@/components/ai-copilot-dynamic';
import { TrialBanner } from '@/components/trial-banner';
import { PaymentFailureBanner } from '@/components/payment-failure-banner';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PaymentFailureBanner />
      <TrialBanner />
      <AppShell>{children}</AppShell>
      <AICopilotLoader />
    </>
  );
}
