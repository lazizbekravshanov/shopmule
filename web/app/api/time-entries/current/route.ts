import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
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
    include: {
      repairOrder: true,
    },
  })

  return NextResponse.json(entry)
}
