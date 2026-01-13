"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BackButton } from "@/components/dashboard/back-button"

interface ShiftPunch {
  id: string
  clockInAt: string
  clockOutAt: string | null
}

interface TimeEntry {
  id: string
  repairOrderId: string
  clockIn: string
  clockOut: string | null
  notes: string | null
}

export default function TimeClockPage() {
  const [currentPunch, setCurrentPunch] = useState<ShiftPunch | null>(null)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])

  useEffect(() => {
    loadStatus()
    loadTodayEntries()
    const interval = setInterval(() => {
      loadStatus()
      loadTodayEntries()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      const [punchRes, entryRes] = await Promise.all([
        fetch("/api/attendance/status"),
        fetch("/api/time-entries/current"),
      ])
      if (punchRes.ok) {
        const punch = await punchRes.json()
        setCurrentPunch(punch)
      }
      if (entryRes.ok) {
        const entry = await entryRes.json()
        setCurrentEntry(entry)
      }
    } catch (err) {
      console.error("Failed to load status", err)
    }
  }

  const loadTodayEntries = async () => {
    try {
      const res = await fetch("/api/time-entries/today")
      if (res.ok) {
        const data = await res.json()
        setTodayEntries(data)
      }
    } catch (err) {
      console.error("Failed to load today entries", err)
    }
  }

  const handleClockIn = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/attendance/clock-in", { method: "POST" })
      if (res.ok) {
        await loadStatus()
      } else {
        alert("Failed to clock in")
      }
    } catch (err) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/attendance/clock-out", { method: "POST" })
      if (res.ok) {
        await loadStatus()
      } else {
        alert("Failed to clock out")
      }
    } catch (err) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleStartEntry = async () => {
    const roId = prompt("Enter Repair Order ID:")
    if (!roId) return

    setLoading(true)
    try {
      const res = await fetch("/api/time-entries/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repairOrderId: roId }),
      })
      if (res.ok) {
        await loadStatus()
        await loadTodayEntries()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to start time entry")
      }
    } catch (err) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleStopEntry = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/time-entries/stop", { method: "POST" })
      if (res.ok) {
        await loadStatus()
        await loadTodayEntries()
      } else {
        alert("Failed to stop time entry")
      }
    } catch (err) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getDuration = (start: string, end: string | null) => {
    const startTime = new Date(start).getTime()
    const endTime = end ? new Date(end).getTime() : Date.now()
    const hours = (endTime - startTime) / 3600000
    return hours.toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton href="/dashboard" />
        <div>
          <h1 className="text-3xl font-bold">Time Clock</h1>
          <p className="text-gray-600 mt-1">Clock in/out and track time on repair orders</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shift Status</CardTitle>
            <CardDescription>Your current shift punch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPunch ? (
              <div>
                <p className="text-sm text-gray-600">Clocked in at:</p>
                <p className="text-lg font-medium">
                  {new Date(currentPunch.clockInAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">Duration:</p>
                <p className="text-lg font-medium">
                  {getDuration(currentPunch.clockInAt, currentPunch.clockOutAt)} hours
                </p>
                <Button
                  onClick={handleClockOut}
                  disabled={loading}
                  className="mt-4 w-full"
                  variant="destructive"
                >
                  Clock Out
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">Not clocked in</p>
                <Button onClick={handleClockIn} disabled={loading} className="w-full">
                  Clock In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Time Entry</CardTitle>
            <CardDescription>Current time tracking on repair order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentEntry ? (
              <div>
                <p className="text-sm text-gray-600">RO: {currentEntry.repairOrderId.slice(0, 8)}</p>
                <p className="text-sm text-gray-600">Started at:</p>
                <p className="text-lg font-medium">
                  {new Date(currentEntry.clockIn).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">Duration:</p>
                <p className="text-lg font-medium">
                  {getDuration(currentEntry.clockIn, currentEntry.clockOut)} hours
                </p>
                {currentEntry.notes && (
                  <p className="text-sm text-gray-600 mt-2">Notes: {currentEntry.notes}</p>
                )}
                <Button
                  onClick={handleStopEntry}
                  disabled={loading}
                  className="mt-4 w-full"
                  variant="destructive"
                >
                  Stop Time Entry
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">No active time entry</p>
                <Button
                  onClick={handleStartEntry}
                  disabled={loading || !currentPunch}
                  className="w-full"
                >
                  Start Time Entry
                </Button>
                {!currentPunch && (
                  <p className="text-xs text-gray-500 mt-2">
                    You must be clocked in to start a time entry
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Time Entries</CardTitle>
          <CardDescription>Your time entries for today</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repair Order</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    RO-{entry.repairOrderId.slice(0, 8)}
                  </TableCell>
                  <TableCell>{new Date(entry.clockIn).toLocaleString()}</TableCell>
                  <TableCell>
                    {entry.clockOut ? new Date(entry.clockOut).toLocaleString() : "Ongoing"}
                  </TableCell>
                  <TableCell>{getDuration(entry.clockIn, entry.clockOut)} hours</TableCell>
                  <TableCell>{entry.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
