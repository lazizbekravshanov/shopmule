"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"
import {
  ROLE_PERMISSIONS,
  type Permission,
} from "@/lib/auth/permissions"
import type { Role } from "@prisma/client"

export function usePermissions() {
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined

  const permissions = useMemo(() => {
    if (!role) return new Set<Permission>()
    return new Set<Permission>(ROLE_PERMISSIONS[role] ?? [])
  }, [role])

  const hasPermission = useMemo(
    () => (permission: Permission) => permissions.has(permission),
    [permissions]
  )

  const hasAnyPermission = useMemo(
    () => (required: Permission[]) => required.some((p) => permissions.has(p)),
    [permissions]
  )

  const hasAllPermissions = useMemo(
    () => (required: Permission[]) => required.every((p) => permissions.has(p)),
    [permissions]
  )

  return {
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner: role === "OWNER",
    isAdmin: role === "ADMIN" || role === "OWNER",
  }
}
