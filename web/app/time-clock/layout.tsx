import { AppShell } from '@/components/layout/app-shell';

export default function TimeClockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
