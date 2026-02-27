import { NextResponse } from "next/server"
import { withPermission } from "@/lib/auth/with-permission"
import { P } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db"
import { computeHoursFromPunches, getPeriodRange } from "@/lib/efficiency-utils"
import { calculatePay } from "@/lib/payroll-utils"
import type { PayPeriod } from "@/lib/payroll-utils"

export const dynamic = "force-dynamic"

export const GET = withPermission(P.REPORTS_VIEW_FINANCIAL, async (request, { auth, params: paramsPromise }) => {
  const params = await paramsPromise
  const employeeId = params.employeeId

  const { searchParams } = new URL(request.url)
  const period = (searchParams.get("period") || "week") as PayPeriod
  const periodStart = getPeriodRange(period)
  const now = new Date()

  const employee = await prisma.employeeProfile.findFirst({
    where: { id: employeeId, tenantId: auth.tenantId },
  })

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  const overtimeRule = await prisma.overtimeRule.findFirst({
    where: { isActive: true },
  })

  const punchRecords = await prisma.punchRecord.findMany({
    where: {
      employeeId,
      timestamp: { gte: periodStart },
    },
    orderBy: { timestamp: "asc" },
  })

  const deductions = await prisma.deduction.findMany({
    where: { tenantId: auth.tenantId, employeeId, isActive: true },
  })

  const loans = await prisma.loanAdvance.findMany({
    where: { tenantId: auth.tenantId, employeeId, isActive: true },
  })

  const weeksInPeriod =
    period === "week" ? 1 : period === "month" ? 4 : period === "quarter" ? 13 : 52

  const totalHours = computeHoursFromPunches(punchRecords, now)

  let regularHours: number
  let overtimeHours: number

  if (overtimeRule) {
    const totalThreshold = overtimeRule.weeklyThresholdHours * weeksInPeriod
    regularHours = Math.min(totalHours, totalThreshold)
    overtimeHours = Math.max(0, totalHours - totalThreshold)
  } else {
    regularHours = totalHours
    overtimeHours = 0
  }

  regularHours = Math.round(regularHours * 100) / 100
  overtimeHours = Math.round(overtimeHours * 100) / 100

  const pay = calculatePay(employee, regularHours, overtimeHours, overtimeRule, deductions, loans, period)

  // Build daily breakdown
  const punchesByDay = new Map<string, typeof punchRecords>()
  for (const punch of punchRecords) {
    const dateKey = punch.timestamp.toISOString().split("T")[0]
    if (!punchesByDay.has(dateKey)) punchesByDay.set(dateKey, [])
    punchesByDay.get(dateKey)!.push(punch)
  }

  const dailyBreakdown = Array.from(punchesByDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayPunches]) => {
      const clockIn = dayPunches.find((p) => p.type === "CLOCK_IN")
      const clockOut = [...dayPunches].reverse().find((p) => p.type === "CLOCK_OUT")
      const dayHours = computeHoursFromPunches(dayPunches, now)

      let dayRegular: number
      let dayOvertime: number

      if (overtimeRule?.dailyThresholdHours) {
        dayRegular = Math.min(dayHours, overtimeRule.dailyThresholdHours)
        dayOvertime = Math.max(0, dayHours - overtimeRule.dailyThresholdHours)
      } else {
        dayRegular = dayHours
        dayOvertime = 0
      }

      const dayRate = employee.payRate || 0
      const otMultiplier = overtimeRule?.overtimeMultiplier ?? 1.5
      const dayPay = dayRegular * dayRate + dayOvertime * dayRate * otMultiplier

      return {
        date,
        clockIn: clockIn?.timestamp.toISOString() ?? null,
        clockOut: clockOut?.timestamp.toISOString() ?? null,
        regularHours: Math.round(dayRegular * 100) / 100,
        overtimeHours: Math.round(dayOvertime * 100) / 100,
        pay: Math.round(dayPay * 100) / 100,
      }
    })

  return NextResponse.json({
    employee: {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      payRate: employee.payRate,
      payType: employee.payType,
      overtimeRate: employee.overtimeRate,
    },
    period,
    periodStart: periodStart.toISOString(),
    pay: {
      regularPay: pay.regularPay,
      overtimePay: pay.overtimePay,
      grossPay: pay.grossPay,
      totalDeductions: pay.totalDeductions,
      loanRepayments: pay.loanRepayments,
      netPay: pay.netPay,
    },
    deductionBreakdown: pay.deductionBreakdown,
    dailyBreakdown,
    regularHours,
    overtimeHours,
  })
})
