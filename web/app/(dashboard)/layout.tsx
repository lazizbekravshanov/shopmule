import { AppShell } from '@/components/layout/app-shell';
import { AICopilotLoader } from '@/components/ai-copilot-dynamic';
import { TrialBanner } from '@/components/trial-banner';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TrialBanner />
      <AppShell>{children}</AppShell>
      <AICopilotLoader />
    </>
  );
}
