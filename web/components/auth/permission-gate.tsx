"use client"

import type { ReactNode } from "react"
import { usePermissions } from "@/lib/hooks/use-permissions"
import type { Permission } from "@/lib/auth/permissions"

interface PermissionGateProps {
  /** Single permission required */
  permission?: Permission
  /** Any of these permissions grants access */
  anyPermission?: Permission[]
  /** All of these permissions required */
  allPermissions?: Permission[]
  /** Shown when access is denied */
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGate({
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let allowed = true

  if (permission) {
    allowed = hasPermission(permission)
  } else if (anyPermission) {
    allowed = hasAnyPermission(anyPermission)
  } else if (allPermissions) {
    allowed = hasAllPermissions(allPermissions)
  }

  if (!allowed) return <>{fallback}</>
  return <>{children}</>
}
