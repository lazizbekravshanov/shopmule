import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/auth/with-permission"
import { P } from "@/lib/auth/permissions"
import { z } from "zod"
import { isValidId } from "@/lib/security"

const createOverrideSchema = z.object({
  userId: z.string().min(1),
  permission: z.string().min(1),
  granted: z.boolean().default(true),
  reason: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
})

const deleteOverrideSchema = z.object({
  userId: z.string().min(1),
  permission: z.string().min(1),
})

export const GET = withPermission(P.USERS_MANAGE_PERMISSIONS, async (request, { auth }) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId || !isValidId(userId)) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 })
    }

    // Verify user belongs to same tenant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true },
    })
    if (!user || user.tenantId !== auth.tenantId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const overrides = await prisma.permissionOverride.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      overrides.map((o) => ({
        id: o.id,
        userId: o.userId,
        permission: o.permission,
        granted: o.granted,
        grantedBy: o.grantedBy,
        reason: o.reason,
        expiresAt: o.expiresAt?.toISOString() ?? null,
        createdAt: o.createdAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error("GET /api/permissions error:", error)
    return NextResponse.json({ error: "Failed to fetch permission overrides" }, { status: 500 })
  }
})

export const POST = withPermission(P.USERS_MANAGE_PERMISSIONS, async (request, { auth }) => {
  try {
    const body = await request.json()
    const parsed = createOverrideSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { userId, permission, granted, reason, expiresAt } = parsed.data

    if (!isValidId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Verify user belongs to same tenant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, email: true },
    })
    if (!user || user.tenantId !== auth.tenantId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const override = await prisma.permissionOverride.upsert({
      where: { userId_permission: { userId, permission } },
      update: {
        granted,
        grantedBy: auth.userId,
        reason: reason ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      create: {
        userId,
        permission,
        granted,
        grantedBy: auth.userId,
        reason: reason ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    // Log to audit
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        userEmail: auth.email,
        action: "PERMISSION_CHANGE",
        entityType: "PermissionOverride",
        entityId: override.id,
        newValues: {
          targetUserId: userId,
          targetEmail: user.email,
          permission,
          granted,
          reason,
          expiresAt,
        },
      },
    })

    return NextResponse.json(
      {
        id: override.id,
        userId: override.userId,
        permission: override.permission,
        granted: override.granted,
        grantedBy: override.grantedBy,
        reason: override.reason,
        expiresAt: override.expiresAt?.toISOString() ?? null,
        createdAt: override.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/permissions error:", error)
    return NextResponse.json({ error: "Failed to create permission override" }, { status: 500 })
  }
})

export const DELETE = withPermission(P.USERS_MANAGE_PERMISSIONS, async (request, { auth }) => {
  try {
    const body = await request.json()
    const parsed = deleteOverrideSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { userId, permission } = parsed.data

    if (!isValidId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Verify user belongs to same tenant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, email: true },
    })
    if (!user || user.tenantId !== auth.tenantId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existing = await prisma.permissionOverride.findUnique({
      where: { userId_permission: { userId, permission } },
    })
    if (!existing) {
      return NextResponse.json({ error: "Permission override not found" }, { status: 404 })
    }

    await prisma.permissionOverride.delete({
      where: { userId_permission: { userId, permission } },
    })

    // Log to audit
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        userEmail: auth.email,
        action: "PERMISSION_CHANGE",
        entityType: "PermissionOverride",
        entityId: existing.id,
        oldValues: {
          targetUserId: userId,
          targetEmail: user.email,
          permission,
          granted: existing.granted,
        },
        newValues: { removed: true },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/permissions error:", error)
    return NextResponse.json({ error: "Failed to remove permission override" }, { status: 500 })
  }
})
