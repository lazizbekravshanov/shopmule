import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Token is required"),
  name: z.string().min(1, "Name is required").max(200),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = acceptInviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, name, password } = parsed.data

    const invite = await prisma.invite.findUnique({ where: { token } })
    if (!invite) {
      return NextResponse.json({ error: "Invalid invite token" }, { status: 404 })
    }

    if (invite.acceptedAt) {
      return NextResponse.json({ error: "Invite already accepted" }, { status: 400 })
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and employee profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId: invite.tenantId,
          email: invite.email,
          passwordHash,
          name,
          role: invite.role,
        },
      })

      const employee = await tx.employeeProfile.create({
        data: {
          tenantId: invite.tenantId,
          userId: user.id,
          name,
          role: invite.role,
          payRate: 0,
          status: "active",
        },
      })

      await tx.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      })

      // Log to audit
      await tx.auditLog.create({
        data: {
          tenantId: invite.tenantId,
          userId: user.id,
          userEmail: invite.email,
          action: "CREATE",
          entityType: "User",
          entityId: user.id,
          newValues: { role: invite.role, inviteId: invite.id },
        },
      })

      return { user, employee }
    })

    return NextResponse.json(
      {
        id: result.employee.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/invites/accept error:", error)
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 })
  }
}
