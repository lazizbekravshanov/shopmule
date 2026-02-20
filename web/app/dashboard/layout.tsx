import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/app-shell';

// Lazy-load the AI copilot — it's 329 LOC and not needed until user opens it
const AICopilot = dynamic(() => import('@/components/ai-copilot').then((m) => ({ default: m.AICopilot })), {
  ssr: false,
});

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
