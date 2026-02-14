import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST() {
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

  const entry = await prisma.timeEntry.findFirst({
    where: {
      employeeId: employee.id,
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
