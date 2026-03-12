import type { SubscriptionPlan } from "@prisma/client"
import { prisma } from "./db"

/**
 * Single source of truth for plan limits.
 * Every feature gate in the app checks against this.
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, {
  maxEmployees: number
  aiAccess: boolean
  fleetAccounts: boolean
  multiLocation: boolean
  maxWorkOrdersPerMonth: number
}> = {
  FREE: {
    maxEmployees: 2,
    aiAccess: false,
    fleetAccounts: false,
    multiLocation: false,
    maxWorkOrdersPerMonth: 20,
  },
  STARTER: {
    maxEmployees: 5,
    aiAccess: true,
    fleetAccounts: false,
    multiLocation: false,
    maxWorkOrdersPerMonth: 500,
  },
  PRO: {
    maxEmployees: 15,
    aiAccess: true,
    fleetAccounts: true,
    multiLocation: false,
    maxWorkOrdersPerMonth: 5000,
  },
  ENTERPRISE: {
    maxEmployees: Infinity,
    aiAccess: true,
    fleetAccounts: true,
    multiLocation: true,
    maxWorkOrdersPerMonth: Infinity,
  },
}

export type PlanFeature = keyof typeof PLAN_LIMITS.FREE

interface PlanCheckResult {
  allowed: boolean
  error?: string
  currentPlan?: SubscriptionPlan
  requiredPlan?: string
}

/**
 * Get the tenant's current plan. Returns FREE if tenant not found.
 */
async function getTenantPlan(tenantId: string): Promise<SubscriptionPlan> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { subscriptionPlan: true },
  })
  return tenant?.subscriptionPlan ?? "FREE"
}

/**
 * Check if a boolean feature is enabled for the tenant's plan.
 */
export async function checkFeatureAccess(
  tenantId: string,
  feature: "aiAccess" | "fleetAccounts" | "multiLocation"
): Promise<PlanCheckResult> {
  const plan = await getTenantPlan(tenantId)
  const limits = PLAN_LIMITS[plan]

  if (limits[feature]) {
    return { allowed: true, currentPlan: plan }
  }

  // Find the cheapest plan that has this feature
  const upgradeTo = (Object.entries(PLAN_LIMITS) as [SubscriptionPlan, typeof limits][])
    .find(([, l]) => l[feature])?.[0]

  return {
    allowed: false,
    currentPlan: plan,
    requiredPlan: upgradeTo,
    error: `This feature requires the ${upgradeTo} plan or higher.`,
  }
}

/**
 * Check if the tenant can add another employee.
 */
export async function checkEmployeeLimit(tenantId: string): Promise<PlanCheckResult> {
  const plan = await getTenantPlan(tenantId)
  const limits = PLAN_LIMITS[plan]

  if (limits.maxEmployees === Infinity) {
    return { allowed: true, currentPlan: plan }
  }

  const count = await prisma.employeeProfile.count({
    where: { tenantId },
  })

  if (count >= limits.maxEmployees) {
    const upgradeTo = (Object.entries(PLAN_LIMITS) as [SubscriptionPlan, typeof limits][])
      .find(([, l]) => l.maxEmployees > limits.maxEmployees)?.[0]

    return {
      allowed: false,
      currentPlan: plan,
      requiredPlan: upgradeTo,
      error: `Your ${plan} plan allows up to ${limits.maxEmployees} team members. Upgrade to ${upgradeTo} for more.`,
    }
  }

  return { allowed: true, currentPlan: plan }
}
