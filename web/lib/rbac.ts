import { Role } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }
  return session
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard")
  }
  return session
}

export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole)
}
