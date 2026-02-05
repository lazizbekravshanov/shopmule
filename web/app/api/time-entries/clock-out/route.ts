import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find employee profile for this user
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId: authResult.user.id },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee profile not found" }, { status: 404 })
    }

    // Find current open time entry
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId: employee.id,
        clockOut: null,
      },
      orderBy: { clockIn: "desc" },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Not clocked in" }, { status: 400 })
    }

    // Update the time entry with clock out time
    const clockOutTime = new Date()
    const entry = await prisma.timeEntry.update({
      where: { id: existingEntry.id },
      data: {
        clockOut: clockOutTime,
      },
    })

    // Calculate duration in minutes
    const durationMs = clockOutTime.getTime() - entry.clockIn.getTime()
    const durationMinutes = Math.round(durationMs / 60000)
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60

    return NextResponse.json({
      id: entry.id,
      clockIn: entry.clockIn.toISOString(),
      clockOut: entry.clockOut?.toISOString(),
      duration: {
        hours,
        minutes,
        totalMinutes: durationMinutes,
        formatted: `${hours}h ${minutes}m`,
      },
      message: "Clocked out successfully",
    })
  } catch (error) {
    console.error("Error clocking out:", error)
    return NextResponse.json(
      { error: "Failed to clock out" },
      { status: 500 }
    )
  }
}
