import { requireAuth } from "@/lib/rbac"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BackButton } from "@/components/dashboard/back-button"

export default async function RepairOrderDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const params = await paramsPromise

  const workOrder = await prisma.workOrder.findFirst({
    where: { id: params.id },
    include: {
      Customer: true,
      Vehicle: true,
      Labor: true,
      Parts: {
        include: { Part: true },
      },
    },
  })

  if (!workOrder) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <BackButton href="/repair-orders" />
          <div>
            <h1 className="text-3xl font-bold">Repair Order RO-{workOrder.id.slice(0, 8)}</h1>
            <p className="text-gray-600 mt-1">{workOrder.Customer?.name || "Unknown"}</p>
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
                {workOrder.status}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">Customer:</span> {workOrder.Customer?.name || "Unknown"}
            </div>
            {workOrder.Vehicle && (
              <div>
                <span className="text-sm font-medium">Vehicle:</span>{" "}
                {workOrder.Vehicle.make} {workOrder.Vehicle.model} ({workOrder.Vehicle.vin})
              </div>
            )}
            <div>
              <span className="text-sm font-medium">Opened:</span>{" "}
              {new Date(workOrder.createdAt).toLocaleString()}
            </div>
            {workOrder.internalNotes && (
              <div>
                <span className="text-sm font-medium">Internal Notes:</span>
                <p className="mt-1 text-sm text-gray-600">{workOrder.internalNotes}</p>
              </div>
            )}
            {workOrder.customerVisibleNotes && (
              <div>
                <span className="text-sm font-medium">Customer Notes:</span>
                <p className="mt-1 text-sm text-gray-600">{workOrder.customerVisibleNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor Lines</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrder.Labor.length === 0 ? (
              <p className="text-sm text-gray-600">No labor lines</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrder.Labor.map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.note || "Labor"}</TableCell>
                      <TableCell>{line.hours.toString()}</TableCell>
                      <TableCell>${line.rate.toString()}</TableCell>
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
            {workOrder.Parts.length === 0 ? (
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
                  {workOrder.Parts.map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.Part?.name || "Custom Part"}</TableCell>
                      <TableCell>{line.quantity}</TableCell>
                      <TableCell>${line.unitPrice.toString()}</TableCell>
                      <TableCell>${(Number(line.quantity) * Number(line.unitPrice)).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
