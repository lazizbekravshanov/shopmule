import { vi } from "vitest";

/**
 * Creates a mock Prisma client with vi.fn() stubs for every model method.
 * Usage: call createMockPrisma() in beforeEach, then set return values per test.
 */
function modelMethods() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
    upsert: vi.fn(),
  };
}

export function createMockPrisma() {
  const mock = {
    user: modelMethods(),
    tenant: modelMethods(),
    workOrder: modelMethods(),
    vehicle: modelMethods(),
    customer: modelMethods(),
    invoice: modelMethods(),
    payment: modelMethods(),
    part: modelMethods(),
    employeeProfile: modelMethods(),
    attendanceNotification: modelMethods(),
    customerNotification: modelMethods(),
    notificationPreference: modelMethods(),
    workOrderStatusHistory: modelMethods(),
    workOrderAssignment: modelMethods(),
    workOrderLabor: modelMethods(),
    workOrderPart: modelMethods(),
    workOrderPhoto: modelMethods(),
    vehicleServiceHistory: modelMethods(),
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => {
      // If called with a function, execute it with the mock as the tx client
      if (typeof fn === "function") return fn(mock);
      // If called with an array of promises, resolve them
      return Promise.all(fn);
    }),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
  return mock;
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;

// Auto-mock @/lib/db so any import gets the mock
const mockPrisma = createMockPrisma();

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

export { mockPrisma };
