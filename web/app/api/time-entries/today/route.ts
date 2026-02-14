import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find employee profile for this user
  const employee = await prisma.employeeProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!employee) {
    return NextResponse.json({ error: "Employee profile not found" }, { status: 404 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const entries = await prisma.timeEntry.findMany({
    where: {
      employeeId: employee.id,
      clockIn: {
        gte: today,
      },
    },
    orderBy: { clockIn: "desc" },
  })

  return NextResponse.json(entries)
}
