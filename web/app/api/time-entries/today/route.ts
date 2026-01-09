import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const entries = await prisma.timeEntry.findMany({
    where: {
      shopId: session.user.shopId,
      techId: session.user.id,
      clockIn: {
        gte: today,
      },
    },
    include: {
      repairOrder: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: { clockIn: "desc" },
  })

  return NextResponse.json(entries)
}
