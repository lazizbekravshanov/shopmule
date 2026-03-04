import { vi } from "vitest";

export const TEST_USER = {
  id: "user-001",
  email: "admin@testshop.com",
  name: "Test Admin",
  role: "OWNER" as const,
  tenantId: "tenant-001",
  shopId: "tenant-001",
};

export const TEST_SESSION = {
  user: TEST_USER,
  expires: new Date(Date.now() + 86400000).toISOString(),
};

// Mock next-auth's getServerSession to return TEST_SESSION by default
const mockGetServerSession = vi.fn().mockResolvedValue(TEST_SESSION);

vi.mock("next-auth", () => ({
  getServerSession: mockGetServerSession,
}));

export { mockGetServerSession };
