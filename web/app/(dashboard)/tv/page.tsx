"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DashboardData {
  clockedIn: Array<{
    user_id: string
    name: string
    duration_minutes: number
  }>
  activeOrders: {
    count: number
    top: Array<{
      id: string
      customer__name: string
      unit__vin: string
      status: string
    }>
  }
  leaderboard: Array<{
    tech_id: string
    name: string
    clocked_hours: number
    wrench_hours: number
    billed_hours: number
    utilization: number
    efficiency: number
  }>
  throughput: {
    jobs_closed: number
    average_in_progress_to_closed_minutes: number
    comebacks: number
  }
}

export default function TVDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      alert("Token required")
      return
    }

    const loadData = async () => {
      try {
        const res = await fetch(`/api/tv/dashboard?token=${token}&range=today`)
        if (res.ok) {
          const dashboardData = await res.json()
          setData(dashboardData)
        } else {
          alert("Failed to load dashboard data")
        }
      } catch (err) {
        console.error("Failed to load data", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl">No data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">ShopMule TV Dashboard</h1>
          <p className="text-2xl text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{data.activeOrders.count}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Jobs Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{data.throughput.jobs_closed}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Clocked In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{data.clockedIn.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Leaderboard</CardTitle>
              <CardDescription className="text-gray-400">
                Technician performance today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Tech</TableHead>
                    <TableHead className="text-gray-300">Clocked</TableHead>
                    <TableHead className="text-gray-300">Wrench</TableHead>
                    <TableHead className="text-gray-300">Billed</TableHead>
                    <TableHead className="text-gray-300">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.leaderboard
                    .sort((a, b) => b.efficiency - a.efficiency)
                    .map((tech) => (
                      <TableRow key={tech.tech_id} className="border-gray-800">
                        <TableCell className="font-medium text-white">{tech.name}</TableCell>
                        <TableCell className="text-gray-300">{tech.clocked_hours}h</TableCell>
                        <TableCell className="text-gray-300">{tech.wrench_hours}h</TableCell>
                        <TableCell className="text-gray-300">{tech.billed_hours}h</TableCell>
                        <TableCell className="text-gray-300">
                          {tech.efficiency > 0 ? `${tech.efficiency.toFixed(2)}x` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Active Repair Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.activeOrders.top.slice(0, 5).map((order) => (
                  <div key={order.id} className="border-b border-gray-800 pb-2">
                    <div className="font-medium">RO-{order.id.slice(0, 8)}</div>
                    <div className="text-sm text-gray-400">
                      {order.customer__name} - {order.unit__vin || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
