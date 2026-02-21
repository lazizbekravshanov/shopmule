import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth, withPermission } from "@/lib/auth/with-permission"
import { P } from "@/lib/auth/permissions"
import { z } from "zod"
import crypto from "crypto"

const VALID_ROLES = [
  "OWNER", "ADMIN", "MANAGER", "SERVICE_MANAGER", "SERVICE_ADVISOR",
  "PARTS_MANAGER", "OFFICE_MANAGER", "SENIOR_TECHNICIAN", "MECHANIC",
  "TECHNICIAN", "FRONT_DESK", "TIMESHEET_USER", "CUSTOMER",
] as const

const createInviteSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(VALID_ROLES),
})

export const GET = withAuth(async (_request, { auth }) => {
  try {
    const invites = await prisma.invite.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      invites.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        invitedBy: inv.invitedBy,
        expiresAt: inv.expiresAt.toISOString(),
        acceptedAt: inv.acceptedAt?.toISOString() ?? null,
        createdAt: inv.createdAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error("GET /api/invites error:", error)
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 })
  }
})

export const POST = withPermission(P.USERS_CREATE, async (request, { auth }) => {
  try {
    const body = await request.json()
    const parsed = createInviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, role } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists in tenant
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existingUser && existingUser.tenantId === auth.tenantId) {
      return NextResponse.json(
        { error: "A user with this email already exists in this organization" },
        { status: 409 }
      )
    }

    // Check for existing pending invite
    const existingInvite = await prisma.invite.findUnique({
      where: { tenantId_email: { tenantId: auth.tenantId, email: normalizedEmail } },
    })
    if (existingInvite && !existingInvite.acceptedAt && existingInvite.expiresAt > new Date()) {
      return NextResponse.json(
        { error: "An active invite already exists for this email" },
        { status: 409 }
      )
    }

    // Delete expired/accepted invite if exists, to allow re-invite
    if (existingInvite) {
      await prisma.invite.delete({ where: { id: existingInvite.id } })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const invite = await prisma.invite.create({
      data: {
        tenantId: auth.tenantId,
        email: normalizedEmail,
        role,
        invitedBy: auth.userId,
        token,
        expiresAt,
      },
    })

    return NextResponse.json(
      {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/invites error:", error)
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 })
  }
})
