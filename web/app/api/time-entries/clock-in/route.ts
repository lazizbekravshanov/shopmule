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

    // Check if already clocked in
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId: employee.id,
        clockOut: null,
      },
    })

    if (existingEntry) {
      return NextResponse.json({ error: "Already clocked in" }, { status: 400 })
    }

    // Create new time entry
    const entry = await prisma.timeEntry.create({
      data: {
        employeeId: employee.id,
        clockIn: new Date(),
      },
    })

    return NextResponse.json({
      id: entry.id,
      clockIn: entry.clockIn.toISOString(),
      message: "Clocked in successfully",
    }, { status: 201 })
  } catch (error) {
    console.error("Error clocking in:", error)
    return NextResponse.json(
      { error: "Failed to clock in" },
      { status: 500 }
    )
  }
}
