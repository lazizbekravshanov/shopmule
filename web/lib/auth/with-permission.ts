import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"
import {
  Permission,
  resolvePermissions,
  hasPermission,
} from "./permissions"
import type { Role } from "@prisma/client"

export interface AuthContext {
  userId: string
  email: string
  role: Role
  tenantId: string
  permissions: Set<Permission>
}

type AuthedHandler = (
  request: Request,
  context: { auth: AuthContext; params: Promise<Record<string, string>> }
) => Promise<Response>

/**
 * Wrap an API route handler with permission checking.
 * Authenticates via session or Bearer token, resolves permissions (including overrides),
 * then verifies the required permission before calling the handler.
 */
export function withPermission(permission: Permission, handler: AuthedHandler) {
  return async (
    request: Request,
    routeContext: { params: Promise<Record<string, string>> }
  ) => {
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Resolve tenantId — session-based auth includes it, Bearer tokens may not
    let tenantId = authResult.tenantId
    if (!tenantId) {
      const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
        select: { tenantId: true },
      })
      tenantId = user?.tenantId ?? null
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: "No tenant associated with user" },
        { status: 403 }
      )
    }

    // Resolve permissions with overrides
    const permissions = await resolvePermissions(
      authResult.user.id,
      authResult.user.role
    )

    if (!hasPermission(permissions, permission)) {
      return NextResponse.json(
        { error: "Forbidden", requiredPermission: permission },
        { status: 403 }
      )
    }

    const auth: AuthContext = {
      userId: authResult.user.id,
      email: authResult.user.email,
      role: authResult.user.role,
      tenantId,
      permissions,
    }

    return handler(request, { auth, params: routeContext.params })
  }
}

/**
 * Wrap an API route handler with authentication only (no specific permission required).
 * Use for GET endpoints that just need tenant scoping.
 */
export function withAuth(handler: AuthedHandler) {
  return async (
    request: Request,
    routeContext: { params: Promise<Record<string, string>> }
  ) => {
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let tenantId = authResult.tenantId
    if (!tenantId) {
      const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
        select: { tenantId: true },
      })
      tenantId = user?.tenantId ?? null
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: "No tenant associated with user" },
        { status: 403 }
      )
    }

    const permissions = await resolvePermissions(
      authResult.user.id,
      authResult.user.role
    )

    const auth: AuthContext = {
      userId: authResult.user.id,
      email: authResult.user.email,
      role: authResult.user.role,
      tenantId,
      permissions,
    }

    return handler(request, { auth, params: routeContext.params })
  }
}
