import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const punch = await prisma.shiftPunch.findFirst({
    where: {
      shopId: session.user.shopId,
      userId: session.user.id,
      clockOutAt: null,
    },
  })

  if (!punch) {
    return NextResponse.json({ error: "No open punch" }, { status: 400 })
  }

  const updated = await prisma.shiftPunch.update({
    where: { id: punch.id },
    data: { clockOutAt: new Date() },
  })

  return NextResponse.json(updated)
}
