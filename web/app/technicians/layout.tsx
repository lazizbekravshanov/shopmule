import { AppShell } from '@/components/layout/app-shell';

export default function TechniciansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
