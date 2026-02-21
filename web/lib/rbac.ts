import { Role } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"
import { roleHasPermission, type Permission } from "./auth/permissions"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }
  return session
}

/** @deprecated Use requirePermission() instead for granular access control */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard")
  }
  return session
}

/** @deprecated Use roleHasPermission() from lib/auth/permissions instead */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole)
}

/** Require a specific permission (server component / page-level guard) */
export async function requirePermission(permission: Permission) {
  const session = await requireAuth()
  if (!roleHasPermission(session.user.role, permission)) {
    redirect("/dashboard")
  }
  return session
}
