import { vi } from "vitest";

// Mock next/server's after() to execute the callback immediately in tests.
// In production Next.js 16, after() defers work until after the response is sent.
// In tests we want the side-effects to run synchronously so we can assert on them.
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    after: (fn: () => void) => fn(),
  };
});
