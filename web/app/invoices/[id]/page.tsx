import { requireAuth } from "@/lib/rbac"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BackButton } from "@/components/dashboard/back-button"

export default async function InvoiceDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const params = await paramsPromise

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id },
    include: {
      WorkOrder: {
        include: {
          Customer: true,
          Vehicle: true,
          Labor: true,
          Parts: {
            include: { Part: true },
          },
        },
      },
      LegacyPayments: {
        orderBy: { receivedAt: "desc" },
      },
    },
  })

  if (!invoice) {
    notFound()
  }

  const workOrder = invoice.WorkOrder
  const paidAmount = invoice.LegacyPayments.reduce(
    (sum: number, p: { amount: number }) => sum + Number(p.amount),
    0
  )
  const remainingAmount = Number(invoice.total) - paidAmount

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton href="/invoices" />
        <div>
          <h1 className="text-3xl font-bold">Invoice INV-{invoice.id.slice(0, 8)}</h1>
          <p className="text-gray-600 mt-1">{workOrder?.Customer?.name || "Unknown"}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Status:</span>{" "}
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  invoice.status === "PAID"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "PARTIAL"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100"
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">Total:</span> ${Number(invoice.total).toFixed(2)}
            </div>
            <div>
              <span className="text-sm font-medium">Paid:</span> ${paidAmount.toFixed(2)}
            </div>
            <div>
              <span className="text-sm font-medium">Remaining:</span> ${remainingAmount.toFixed(2)}
            </div>
            <div>
              <span className="text-sm font-medium">Created:</span>{" "}
              {new Date(invoice.createdAt).toLocaleString()}
            </div>
            {workOrder && (
              <div>
                <span className="text-sm font-medium">Work Order:</span>{" "}
                <Link
                  href={`/repair-orders/${workOrder.id}`}
                  className="text-blue-600 hover:underline"
                >
                  WO-{workOrder.id.slice(0, 8)}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer & Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Customer:</span> {workOrder?.Customer?.name || "Unknown"}
            </div>
            {workOrder?.Vehicle && (
              <>
                <div>
                  <span className="text-sm font-medium">Vehicle:</span>{" "}
                  {workOrder.Vehicle.make} {workOrder.Vehicle.model}
                </div>
                <div>
                  <span className="text-sm font-medium">VIN:</span> {workOrder.Vehicle.vin}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor Charges</CardTitle>
          </CardHeader>
          <CardContent>
            {!workOrder?.Labor?.length ? (
              <p className="text-sm text-gray-600">No labor lines</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrder.Labor.map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.note || "Labor"}</TableCell>
                      <TableCell>{line.hours.toString()}</TableCell>
                      <TableCell>${line.rate.toString()}</TableCell>
                      <TableCell>
                        ${(Number(line.hours) * Number(line.rate)).toFixed(2)}
                      </TableCell>
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
            {!workOrder?.Parts?.length ? (
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
                      <TableCell>
                        ${(Number(line.quantity) * Number(line.unitPrice)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.LegacyPayments.length === 0 ? (
              <p className="text-sm text-gray-600">No payments recorded</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.LegacyPayments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.receivedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
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
