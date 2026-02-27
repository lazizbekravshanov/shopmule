/**
 * Pure payroll calculation utilities.
 * No DB or framework dependencies — only arithmetic.
 */

export interface PayrollEmployee {
  payRate: number
  payType: 'HOURLY' | 'FLAT_RATE' | 'SALARY'
  overtimeRate?: number | null
}

export interface PayrollOvertimeRule {
  overtimeMultiplier: number
}

export interface PayrollDeduction {
  id: string
  type: string
  description: string
  amount: number
  percentage?: number | null
  isActive: boolean
}

export interface PayrollLoan {
  id: string
  description: string
  monthlyPayment: number
  remainingBalance: number
  isActive: boolean
}

export interface DeductionBreakdown {
  id: string
  type: string
  description: string
  amount: number
}

export interface PayCalculation {
  regularPay: number
  overtimePay: number
  grossPay: number
  totalDeductions: number
  loanRepayments: number
  netPay: number
  deductionBreakdown: DeductionBreakdown[]
}

export type PayPeriod = 'week' | 'month' | 'quarter' | 'year'

/**
 * Calculates pay for an employee based on their pay type, hours, deductions, and loans.
 */
export function calculatePay(
  employee: PayrollEmployee,
  regularHours: number,
  overtimeHours: number,
  overtimeRule: PayrollOvertimeRule | null,
  deductions: PayrollDeduction[],
  loans: PayrollLoan[],
  period: PayPeriod = 'month'
): PayCalculation {
  let regularPay = 0
  let overtimePay = 0
  const multiplier = overtimeRule?.overtimeMultiplier ?? 1.5

  switch (employee.payType) {
    case 'HOURLY': {
      regularPay = regularHours * employee.payRate
      const otRate = employee.overtimeRate ?? employee.payRate * multiplier
      overtimePay = overtimeHours * otRate
      break
    }
    case 'SALARY': {
      // payRate is treated as annual salary
      const divisor = period === 'week' ? 52 : period === 'month' ? 12 : period === 'quarter' ? 4 : 1
      regularPay = employee.payRate / divisor
      // Salary employees still get overtime if hours exceed threshold
      const otRate = employee.overtimeRate ?? (employee.payRate / 2080) * multiplier
      overtimePay = overtimeHours * otRate
      break
    }
    case 'FLAT_RATE': {
      // payRate is per period, no overtime
      regularPay = employee.payRate
      overtimePay = 0
      break
    }
  }

  const grossPay = round(regularPay + overtimePay)

  // Apply deductions
  const deductionBreakdown: DeductionBreakdown[] = []
  let totalDeductions = 0

  for (const ded of deductions) {
    if (!ded.isActive) continue

    let dedAmount: number
    if (ded.percentage != null && ded.percentage > 0) {
      dedAmount = grossPay * (ded.percentage / 100)
    } else {
      dedAmount = ded.amount
    }

    dedAmount = round(dedAmount)
    totalDeductions += dedAmount
    deductionBreakdown.push({
      id: ded.id,
      type: ded.type,
      description: ded.description,
      amount: dedAmount,
    })
  }

  // Apply loan repayments (capped at remaining balance)
  let loanRepayments = 0
  for (const loan of loans) {
    if (!loan.isActive) continue
    const payment = Math.min(loan.monthlyPayment, loan.remainingBalance)
    if (payment > 0) {
      loanRepayments += round(payment)
      deductionBreakdown.push({
        id: loan.id,
        type: 'LOAN_REPAYMENT',
        description: loan.description,
        amount: round(payment),
      })
    }
  }

  totalDeductions = round(totalDeductions)
  loanRepayments = round(loanRepayments)
  const netPay = round(grossPay - totalDeductions - loanRepayments)

  return {
    regularPay: round(regularPay),
    overtimePay: round(overtimePay),
    grossPay,
    totalDeductions,
    loanRepayments,
    netPay,
    deductionBreakdown,
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
