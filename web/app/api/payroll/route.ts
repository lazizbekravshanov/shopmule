import { NextResponse } from "next/server"
import { withPermission } from "@/lib/auth/with-permission"
import { P } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db"
import { computeHoursFromPunches, getPeriodRange } from "@/lib/efficiency-utils"
import { calculatePay } from "@/lib/payroll-utils"
import type { PayPeriod } from "@/lib/payroll-utils"

export const dynamic = "force-dynamic"

export const GET = withPermission(P.REPORTS_VIEW_FINANCIAL, async (request, { auth }) => {
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get("period") || "week") as PayPeriod
  const periodStart = getPeriodRange(period)
  const now = new Date()

  const employees = await prisma.employeeProfile.findMany({
    where: {
      tenantId: auth.tenantId,
      status: "active",
      role: { in: ["MECHANIC", "TECHNICIAN", "SENIOR_TECHNICIAN"] },
    },
  })

  const overtimeRule = await prisma.overtimeRule.findFirst({
    where: { isActive: true },
  })

  const employeeIds = employees.map((e) => e.id)

  const punches = await prisma.punchRecord.findMany({
    where: {
      employeeId: { in: employeeIds },
      timestamp: { gte: periodStart },
    },
    orderBy: { timestamp: "asc" },
  })

  const deductions = await prisma.deduction.findMany({
    where: {
      tenantId: auth.tenantId,
      employeeId: { in: employeeIds },
      isActive: true,
    },
  })

  const loans = await prisma.loanAdvance.findMany({
    where: {
      tenantId: auth.tenantId,
      employeeId: { in: employeeIds },
      isActive: true,
    },
  })

  const weeksInPeriod =
    period === "week" ? 1 : period === "month" ? 4 : period === "quarter" ? 13 : 52

  const totals = {
    grossPay: 0,
    totalDeductions: 0,
    loanRepayments: 0,
    netPay: 0,
    regularHours: 0,
    overtimeHours: 0,
    employeeCount: employees.length,
  }

  const employeeResults = employees.map((employee) => {
    const employeePunches = punches.filter((p) => p.employeeId === employee.id)
    const totalHours = computeHoursFromPunches(employeePunches, now)

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

    const employeeDeductions = deductions.filter((d) => d.employeeId === employee.id)
    const employeeLoans = loans.filter((l) => l.employeeId === employee.id)

    const pay = calculatePay(
      employee,
      regularHours,
      overtimeHours,
      overtimeRule,
      employeeDeductions,
      employeeLoans,
      period
    )

    totals.grossPay += pay.grossPay
    totals.totalDeductions += pay.totalDeductions
    totals.loanRepayments += pay.loanRepayments
    totals.netPay += pay.netPay
    totals.regularHours += regularHours
    totals.overtimeHours += overtimeHours

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      payType: employee.payType,
      payRate: employee.payRate,
      regularHours,
      overtimeHours,
      regularPay: pay.regularPay,
      overtimePay: pay.overtimePay,
      grossPay: pay.grossPay,
      totalDeductions: pay.totalDeductions,
      loanRepayments: pay.loanRepayments,
      netPay: pay.netPay,
    }
  })

  totals.grossPay = Math.round(totals.grossPay * 100) / 100
  totals.totalDeductions = Math.round(totals.totalDeductions * 100) / 100
  totals.loanRepayments = Math.round(totals.loanRepayments * 100) / 100
  totals.netPay = Math.round(totals.netPay * 100) / 100
  totals.regularHours = Math.round(totals.regularHours * 100) / 100
  totals.overtimeHours = Math.round(totals.overtimeHours * 100) / 100

  return NextResponse.json({
    period,
    periodStart: periodStart.toISOString(),
    totals,
    employees: employeeResults,
  })
})
