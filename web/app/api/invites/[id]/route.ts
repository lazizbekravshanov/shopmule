import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/auth/with-permission"
import { P } from "@/lib/auth/permissions"
import { isValidId } from "@/lib/security"

export const DELETE = withPermission(P.USERS_CREATE, async (_request, { auth, params }) => {
  try {
    const { id } = await params

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const invite = await prisma.invite.findUnique({ where: { id } })
    if (!invite || invite.tenantId !== auth.tenantId) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    if (invite.acceptedAt) {
      return NextResponse.json({ error: "Cannot revoke an accepted invite" }, { status: 400 })
    }

    await prisma.invite.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/invites/[id] error:", error)
    return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 })
  }
})
