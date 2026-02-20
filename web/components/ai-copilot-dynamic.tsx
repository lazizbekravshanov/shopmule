'use client';

import dynamic from 'next/dynamic';

const AICopilot = dynamic(
  () => import('@/components/ai-copilot').then((m) => ({ default: m.AICopilot })),
  { ssr: false }
);

export function AICopilotLoader() {
  return <AICopilot />;
}
