import { Role } from "@prisma/client"
import { prisma } from "@/lib/db"

// ==========================================
// Permission Constants
// ==========================================

export const P = {
  // Organization
  ORG_MANAGE_BILLING: "org:manage_billing",
  ORG_MANAGE_SETTINGS: "org:manage_settings",
  ORG_VIEW_SETTINGS: "org:view_settings",

  // Users
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_MANAGE_PERMISSIONS: "users:manage_permissions",

  // Service Orders
  SERVICE_ORDERS_CREATE: "service_orders:create",
  SERVICE_ORDERS_READ_OWN: "service_orders:read_own",
  SERVICE_ORDERS_READ_ALL: "service_orders:read_all",
  SERVICE_ORDERS_UPDATE_OWN: "service_orders:update_own",
  SERVICE_ORDERS_UPDATE_ALL: "service_orders:update_all",
  SERVICE_ORDERS_DELETE: "service_orders:delete",
  SERVICE_ORDERS_APPROVE: "service_orders:approve",
  SERVICE_ORDERS_ASSIGN: "service_orders:assign",

  // Invoices
  INVOICES_CREATE: "invoices:create",
  INVOICES_READ: "invoices:read",
  INVOICES_UPDATE: "invoices:update",
  INVOICES_SEND: "invoices:send",

  // Payments
  PAYMENTS_PROCESS: "payments:process",
  PAYMENTS_VIEW: "payments:view",

  // Inventory
  INVENTORY_READ: "inventory:read",
  INVENTORY_MANAGE: "inventory:manage",
  INVENTORY_ORDER: "inventory:order",

  // Parts Requests
  PARTS_REQUESTS_CREATE: "parts_requests:create",
  PARTS_REQUESTS_APPROVE: "parts_requests:approve",

  // Customers
  CUSTOMERS_CREATE: "customers:create",
  CUSTOMERS_READ: "customers:read",
  CUSTOMERS_UPDATE: "customers:update",
  CUSTOMERS_DELETE: "customers:delete",

  // Vehicles
  VEHICLES_CREATE: "vehicles:create",
  VEHICLES_READ: "vehicles:read",
  VEHICLES_UPDATE: "vehicles:update",

  // Time
  TIME_CLOCK_SELF: "time:clock_self",
  TIME_VIEW_OWN: "time:view_own",
  TIME_VIEW_ALL: "time:view_all",
  TIME_MANAGE: "time:manage",

  // Reports
  REPORTS_VIEW_OPERATIONAL: "reports:view_operational",
  REPORTS_VIEW_FINANCIAL: "reports:view_financial",
  REPORTS_EXPORT: "reports:export",

  // Messages
  MESSAGES_SEND_CUSTOMER: "messages:send_customer",
  MESSAGES_SEND_INTERNAL: "messages:send_internal",

  // Portal (customer-facing)
  PORTAL_SUBMIT_REQUEST: "portal:submit_request",
  PORTAL_VIEW_OWN_VEHICLES: "portal:view_own_vehicles",
  PORTAL_APPROVE_ESTIMATE: "portal:approve_estimate",
  PORTAL_VIEW_OWN_INVOICES: "portal:view_own_invoices",
  PORTAL_MAKE_PAYMENT: "portal:make_payment",
} as const

export type Permission = (typeof P)[keyof typeof P]

// ==========================================
// Role → Permission Matrix
// ==========================================

const ALL_INTERNAL_PERMISSIONS: Permission[] = Object.values(P).filter(
  (p) => !p.startsWith("portal:")
)

const PORTAL_PERMISSIONS: Permission[] = [
  P.PORTAL_SUBMIT_REQUEST,
  P.PORTAL_VIEW_OWN_VEHICLES,
  P.PORTAL_APPROVE_ESTIMATE,
  P.PORTAL_VIEW_OWN_INVOICES,
  P.PORTAL_MAKE_PAYMENT,
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: ALL_INTERNAL_PERMISSIONS,
  ADMIN: ALL_INTERNAL_PERMISSIONS,

  MANAGER: ALL_INTERNAL_PERMISSIONS.filter(
    (p) => p !== P.ORG_MANAGE_BILLING && p !== P.USERS_MANAGE_PERMISSIONS
  ),

  SERVICE_MANAGER: [
    P.SERVICE_ORDERS_CREATE,
    P.SERVICE_ORDERS_READ_OWN,
    P.SERVICE_ORDERS_READ_ALL,
    P.SERVICE_ORDERS_UPDATE_OWN,
    P.SERVICE_ORDERS_UPDATE_ALL,
    P.SERVICE_ORDERS_APPROVE,
    P.SERVICE_ORDERS_ASSIGN,
    P.CUSTOMERS_CREATE,
    P.CUSTOMERS_READ,
    P.CUSTOMERS_UPDATE,
    P.VEHICLES_CREATE,
    P.VEHICLES_READ,
    P.VEHICLES_UPDATE,
    P.INVENTORY_READ,
    P.PARTS_REQUESTS_APPROVE,
    P.PARTS_REQUESTS_CREATE,
    P.INVOICES_READ,
    P.TIME_CLOCK_SELF,
    P.TIME_VIEW_OWN,
    P.TIME_VIEW_ALL,
    P.REPORTS_VIEW_OPERATIONAL,
    P.REPORTS_VIEW_FINANCIAL,
    P.MESSAGES_SEND_CUSTOMER,
    P.MESSAGES_SEND_INTERNAL,
    P.USERS_READ,
  ],

  SERVICE_ADVISOR: [
    P.SERVICE_ORDERS_CREATE,
    P.SERVICE_ORDERS_READ_OWN,
    P.SERVICE_ORDERS_READ_ALL,
    P.SERVICE_ORDERS_UPDATE_OWN,
    P.SERVICE_ORDERS_UPDATE_ALL,
    P.CUSTOMERS_CREATE,
    P.CUSTOMERS_READ,
    P.CUSTOMERS_UPDATE,
    P.VEHICLES_CREATE,
    P.VEHICLES_READ,
    P.VEHICLES_UPDATE,
    P.INVOICES_CREATE,
    P.INVOICES_READ,
    P.INVOICES_SEND,
    P.INVENTORY_READ,
    P.PARTS_REQUESTS_CREATE,
    P.TIME_CLOCK_SELF,
    P.TIME_VIEW_OWN,
    P.MESSAGES_SEND_CUSTOMER,
    P.MESSAGES_SEND_INTERNAL,
  ],

  PARTS_MANAGER: [
    P.INVENTORY_READ,
    P.INVENTORY_MANAGE,
    P.INVENTORY_ORDER,
    P.PARTS_REQUESTS_CREATE,
    P.PARTS_REQUESTS_APPROVE,
    P.SERVICE_ORDERS_READ_ALL,
    P.VEHICLES_READ,
    P.TIME_CLOCK_SELF,
    P.TIME_VIEW_OWN,
    P.MESSAGES_SEND_INTERNAL,
  ],

  OFFICE_MANAGER: [
    P.INVOICES_CREATE,
    P.INVOICES_READ,
    P.INVOICES_UPDATE,
    P.INVOICES_SEND,
    P.PAYMENTS_PROCESS,
    P.PAYMENTS_VIEW,
    P.CUSTOMERS_CREATE,
    P.CUSTOMERS_READ,
    P.CUSTOMERS_UPDATE,
    P.TIME_CLOCK_SELF,
    P.TIME_VIEW_OWN,
    P.TIME_VIEW_ALL,
    P.TIME_MANAGE,
    P.REPORTS_VIEW_OPERATIONAL,
    P.REPORTS_VIEW_FINANCIAL,
    P.REPORTS_EXPORT,
    P.MESSAGES_SEND_CUSTOMER,
    P.MESSAGES_SEND_INTERNAL,
    P.USERS_READ,
  ],

  SENIOR_TECHNICIAN: [
    P.SERVICE_ORDERS_READ_OWN,
    P.SERVICE_ORDERS_UPDATE_OWN,
    P.INVENTORY_READ,
    P.PARTS_REQUESTS_CREATE,
    P.VEHICLES_READ,
    P.TIME_CLOCK_SELF,
    P.TIME_VIEW_OWN,
    P.MESSAGES_SEND_INTERNAL,
  ],

  MECHANIC: [
    P.SERVICE_ORDERS_READ_OWN,
    P.SERVICE_ORDERS_UPDATE_OWN,
    P.INVENTORY_READ,
    P.PARTS_REQUESTS_CREATE,
    P.VEHICLES_READ,
    P.TIME_CLOCK_SELF,
    P.TIME_VIEW_OWN,
  ],

  TECHNICIAN: [
    P.SERVICE_ORDERS_READ_OWN,
    P.SERVICE_ORDERS_UPDATE_OWN,
    P.INVENTORY_READ,
    P.PARTS_REQUESTS_CREATE,
    P.VEHICLES_READ,
    P.TIME_CLOCK_SELF,
    P.TIME_VIEW_OWN,
  ],

  FRONT_DESK: [
    P.CUSTOMERS_CREATE,
    P.CUSTOMERS_READ,
    P.CUSTOMERS_UPDATE,
    P.SERVICE_ORDERS_CREATE,
    P.SERVICE_ORDERS_READ_ALL,
    P.VEHICLES_CREATE,
    P.VEHICLES_READ,
    P.VEHICLES_UPDATE,
    P.INVOICES_READ,
    P.TIME_CLOCK_SELF,
    P.TIME_VIEW_OWN,
    P.MESSAGES_SEND_CUSTOMER,
    P.MESSAGES_SEND_INTERNAL,
  ],

  TIMESHEET_USER: [P.TIME_CLOCK_SELF, P.TIME_VIEW_OWN],

  CUSTOMER: PORTAL_PERMISSIONS,
}

// ==========================================
// Resolver Functions
// ==========================================

/** Check if a role has a specific permission (no DB call) */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/** Resolve effective permissions for a user, including overrides (DB call) */
export async function resolvePermissions(
  userId: string,
  role: Role
): Promise<Set<Permission>> {
  const basePermissions = new Set<Permission>(ROLE_PERMISSIONS[role] ?? [])

  const overrides = await prisma.permissionOverride.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  })

  for (const override of overrides) {
    const perm = override.permission as Permission
    if (override.granted) {
      basePermissions.add(perm)
    } else {
      basePermissions.delete(perm)
    }
  }

  return basePermissions
}

/** Check a single permission against a resolved set */
export function hasPermission(
  perms: Set<Permission>,
  required: Permission
): boolean {
  return perms.has(required)
}

/** Check if any of the required permissions are present */
export function hasAnyPermission(
  perms: Set<Permission>,
  required: Permission[]
): boolean {
  return required.some((p) => perms.has(p))
}

/** Check if all required permissions are present */
export function hasAllPermissions(
  perms: Set<Permission>,
  required: Permission[]
): boolean {
  return required.every((p) => perms.has(p))
}
