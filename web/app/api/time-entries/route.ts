import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get time entries for this employee
    const entries = await prisma.timeEntry.findMany({
      where: {
        employeeId: employee.id,
      },
      orderBy: { clockIn: "desc" },
      take: limit,
      skip: offset,
    })

    // Calculate durations and format response
    const formattedEntries = entries.map((entry) => {
      let duration = null
      if (entry.clockOut) {
        const durationMs = entry.clockOut.getTime() - entry.clockIn.getTime()
        const durationMinutes = Math.round(durationMs / 60000)
        const hours = Math.floor(durationMinutes / 60)
        const minutes = durationMinutes % 60
        duration = {
          hours,
          minutes,
          totalMinutes: durationMinutes,
          formatted: `${hours}h ${minutes}m`,
        }
      }

      return {
        id: entry.id,
        clockIn: entry.clockIn.toISOString(),
        clockOut: entry.clockOut?.toISOString() || null,
        duration,
        jobId: entry.jobId || null,
      }
    })

    // Get total count
    const total = await prisma.timeEntry.count({
      where: { employeeId: employee.id },
    })

    return NextResponse.json({
      entries: formattedEntries,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching time entries:", error)
    return NextResponse.json(
      { error: "Failed to fetch time entries" },
      { status: 500 }
    )
  }
}
