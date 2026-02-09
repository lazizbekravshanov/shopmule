import { AppShell } from '@/components/layout/app-shell';
import { AICopilot } from '@/components/ai-copilot';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <AICopilot />
    </>
  );
}
