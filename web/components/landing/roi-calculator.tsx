'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Clock, DollarSign, TrendingUp, Users } from 'lucide-react'

export function ROICalculator() {
  const [technicians, setTechnicians] = useState(5)
  const [workOrdersPerMonth, setWorkOrdersPerMonth] = useState(150)
  const [avgTicketSize, setAvgTicketSize] = useState(850)
  const [hoursOnPaperwork, setHoursOnPaperwork] = useState(10)

  const calculations = useMemo(() => {
    // Time savings: 70% reduction in admin time
    const hoursSavedPerMonth = hoursOnPaperwork * technicians * 0.7
    const hoursSavedPerYear = hoursSavedPerMonth * 12

    // Revenue from recaptured time (assuming $75/hr billable rate)
    const billableRate = 75
    const revenueFromTimeSavings = hoursSavedPerYear * billableRate

    // Increased throughput: 15% more work orders from efficiency
    const additionalWorkOrders = workOrdersPerMonth * 0.15 * 12
    const revenueFromThroughput = additionalWorkOrders * avgTicketSize

    // Reduced missed follow-ups and lost invoices: 5% revenue recovery
    const currentAnnualRevenue = workOrdersPerMonth * avgTicketSize * 12
    const recoveredRevenue = currentAnnualRevenue * 0.05

    const totalAnnualBenefit = revenueFromTimeSavings + revenueFromThroughput + recoveredRevenue

    // ShopMule cost (Professional plan)
    const monthlyPlanCost = technicians <= 5 ? 149 : technicians <= 15 ? 299 : 599
    const annualCost = monthlyPlanCost * 12

    const netBenefit = totalAnnualBenefit - annualCost
    const roi = ((totalAnnualBenefit - annualCost) / annualCost) * 100

    return {
      hoursSavedPerYear,
      revenueFromTimeSavings,
      additionalWorkOrders: Math.round(additionalWorkOrders),
      revenueFromThroughput,
      recoveredRevenue,
      totalAnnualBenefit,
      annualCost,
      netBenefit,
      roi,
    }
  }, [technicians, workOrdersPerMonth, avgTicketSize, hoursOnPaperwork])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <section id="roi-calculator" className="py-20 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            ROI Calculator
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            See your potential savings
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Enter your shop details to calculate how much time and money ShopMule can save you
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Your Shop Details</h3>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  Number of Technicians
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={technicians}
                  onChange={(e) => setTechnicians(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>1</span>
                  <span className="font-semibold text-amber-600">{technicians}</span>
                  <span>25</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Work Orders per Month
                </label>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={workOrdersPerMonth}
                  onChange={(e) => setWorkOrdersPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>20</span>
                  <span className="font-semibold text-amber-600">{workOrdersPerMonth}</span>
                  <span>500</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  Average Ticket Size
                </label>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="50"
                  value={avgTicketSize}
                  onChange={(e) => setAvgTicketSize(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>$200</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(avgTicketSize)}</span>
                  <span>$3,000</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Hours on Paperwork (per tech/month)
                </label>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={hoursOnPaperwork}
                  onChange={(e) => setHoursOnPaperwork(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>2 hrs</span>
                  <span className="font-semibold text-amber-600">{hoursOnPaperwork} hrs</span>
                  <span>30 hrs</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-neutral-900 rounded-2xl p-6 md:p-8 text-white"
          >
            <h3 className="text-lg font-semibold mb-6">Your Estimated Annual Savings</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-neutral-700">
                <span className="text-neutral-400">Time saved per year</span>
                <span className="font-semibold text-lg">{Math.round(calculations.hoursSavedPerYear).toLocaleString()} hours</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-700">
                <span className="text-neutral-400">Value of time savings</span>
                <span className="font-semibold">{formatCurrency(calculations.revenueFromTimeSavings)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-700">
                <span className="text-neutral-400">Additional work orders</span>
                <span className="font-semibold">+{calculations.additionalWorkOrders}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-700">
                <span className="text-neutral-400">Revenue from throughput</span>
                <span className="font-semibold">{formatCurrency(calculations.revenueFromThroughput)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-700">
                <span className="text-neutral-400">Recovered revenue</span>
                <span className="font-semibold">{formatCurrency(calculations.recoveredRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-700">
                <span className="text-neutral-400">ShopMule annual cost</span>
                <span className="font-semibold text-red-400">-{formatCurrency(calculations.annualCost)}</span>
              </div>
            </div>

            <div className="bg-amber-500/20 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-sm text-amber-400 mb-1">Net Annual Benefit</div>
                <div className="text-4xl md:text-5xl font-bold text-amber-400">
                  {formatCurrency(calculations.netBenefit)}
                </div>
                <div className="text-sm text-neutral-400 mt-2">
                  {Math.round(calculations.roi)}x return on investment
                </div>
              </div>
            </div>

            <a
              href="/login"
              className="block w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-semibold rounded-lg text-center transition-colors"
            >
              Start Free Trial
            </a>
            <p className="text-xs text-neutral-500 text-center mt-3">
              No credit card required. See results in your first week.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
