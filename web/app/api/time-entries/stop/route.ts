import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entry = await prisma.timeEntry.findFirst({
    where: {
      shopId: session.user.shopId,
      techId: session.user.id,
      clockOut: null,
    },
  })

  if (!entry) {
    return NextResponse.json({ error: "No active time entry" }, { status: 400 })
  }

  const updated = await prisma.timeEntry.update({
    where: { id: entry.id },
    data: { clockOut: new Date() },
  })

  return NextResponse.json({ id: updated.id, clockOut: updated.clockOut })
}
