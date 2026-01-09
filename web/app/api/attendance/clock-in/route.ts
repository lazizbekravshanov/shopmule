import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ShiftPunchSource } from "@prisma/client"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existingPunch = await prisma.shiftPunch.findFirst({
    where: {
      shopId: session.user.shopId,
      userId: session.user.id,
      clockOutAt: null,
    },
  })

  if (existingPunch) {
    return NextResponse.json({ error: "Already clocked in" }, { status: 400 })
  }

  const headers = request.headers
  const punch = await prisma.shiftPunch.create({
    data: {
      shopId: session.user.shopId,
      userId: session.user.id,
      source: ShiftPunchSource.WEB,
      ipAddress: headers.get("x-forwarded-for") || headers.get("x-real-ip") || null,
      userAgent: headers.get("user-agent") || null,
    },
  })

  return NextResponse.json(punch)
}
