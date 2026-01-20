import { requireAuth } from "@/lib/rbac"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BackButton } from "@/components/dashboard/back-button"

export default async function RepairOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await requireAuth()
  const shopId = session.user.shopId

  const repairOrder = await prisma.repairOrder.findFirst({
    where: { id: params.id, shopId },
    include: {
      customer: true,
      vehicle: true,
      laborLines: {
        include: { tech: true },
      },
      partLines: {
        include: { part: true },
      },
      timeEntries: {
        include: { tech: true },
        orderBy: { clockIn: "desc" },
      },
    },
  })

  if (!repairOrder) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <BackButton href="/repair-orders" />
          <div>
            <h1 className="text-3xl font-bold">Repair Order RO-{repairOrder.id.slice(0, 8)}</h1>
            <p className="text-gray-600 mt-1">{repairOrder.customer.name}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Status:</span>{" "}
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                {repairOrder.status}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">Customer:</span> {repairOrder.customer.name}
            </div>
            {repairOrder.vehicle && (
              <div>
                <span className="text-sm font-medium">Vehicle:</span>{" "}
                {repairOrder.vehicle.make} {repairOrder.vehicle.model} ({repairOrder.vehicle.vin})
              </div>
            )}
            <div>
              <span className="text-sm font-medium">Opened:</span>{" "}
              {new Date(repairOrder.openedAt).toLocaleString()}
            </div>
            {repairOrder.internalNotes && (
              <div>
                <span className="text-sm font-medium">Internal Notes:</span>
                <p className="mt-1 text-sm text-gray-600">{repairOrder.internalNotes}</p>
              </div>
            )}
            {repairOrder.customerNotes && (
              <div>
                <span className="text-sm font-medium">Customer Notes:</span>
                <p className="mt-1 text-sm text-gray-600">{repairOrder.customerNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor Lines</CardTitle>
          </CardHeader>
          <CardContent>
            {repairOrder.laborLines.length === 0 ? (
              <p className="text-sm text-gray-600">No labor lines</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tech</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repairOrder.laborLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.tech?.name || "Unassigned"}</TableCell>
                      <TableCell>{line.hours.toString()}</TableCell>
                      <TableCell>${line.rate.toString()}</TableCell>
                      <TableCell>{line.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parts</CardTitle>
          </CardHeader>
          <CardContent>
            {repairOrder.partLines.length === 0 ? (
              <p className="text-sm text-gray-600">No parts</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repairOrder.partLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.part?.description || "Custom Part"}</TableCell>
                      <TableCell>{line.qty}</TableCell>
                      <TableCell>${line.unitPrice.toString()}</TableCell>
                      <TableCell>${(Number(line.qty) * Number(line.unitPrice)).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {repairOrder.timeEntries.length === 0 ? (
              <p className="text-sm text-gray-600">No time entries</p>
            ) : (
              <div className="space-y-2">
                {repairOrder.timeEntries.map((entry) => (
                  <div key={entry.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{entry.tech.name || entry.tech.email}</span>
                      {entry.clockOut ? (
                        <span className="text-sm text-gray-600">
                          {Math.round(
                            (new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime()) / 3600000 * 10
                          ) / 10} hours
                        </span>
                      ) : (
                        <span className="text-sm text-blue-600">Active</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.clockIn).toLocaleString()} -{" "}
                      {entry.clockOut ? new Date(entry.clockOut).toLocaleString() : "Ongoing"}
                    </div>
                    {entry.notes && <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
