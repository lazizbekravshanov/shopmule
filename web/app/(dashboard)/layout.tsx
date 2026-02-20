import { AppShell } from '@/components/layout/app-shell';
import { AICopilotLoader } from '@/components/ai-copilot-dynamic';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <AICopilotLoader />
    </>
  );
}
