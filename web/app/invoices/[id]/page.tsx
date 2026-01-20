import { requireAuth } from "@/lib/rbac"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BackButton } from "@/components/dashboard/back-button"

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await requireAuth()
  const shopId = session.user.shopId

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, shopId },
    include: {
      repairOrder: {
        include: {
          customer: true,
          vehicle: true,
          laborLines: {
            include: { tech: true },
          },
          partLines: {
            include: { part: true },
          },
        },
      },
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  })

  if (!invoice) {
    notFound()
  }

  const paidAmount = invoice.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )
  const remainingAmount = Number(invoice.total) - paidAmount

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton href="/invoices" />
        <div>
          <h1 className="text-3xl font-bold">Invoice INV-{invoice.id.slice(0, 8)}</h1>
          <p className="text-gray-600 mt-1">{invoice.repairOrder.customer.name}</p>
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
                    : invoice.status === "PARTIALLY_PAID"
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
              <span className="text-sm font-medium">Issued:</span>{" "}
              {new Date(invoice.issuedAt).toLocaleString()}
            </div>
            <div>
              <span className="text-sm font-medium">Repair Order:</span>{" "}
              <Link
                href={`/repair-orders/${invoice.repairOrder.id}`}
                className="text-blue-600 hover:underline"
              >
                RO-{invoice.repairOrder.id.slice(0, 8)}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer & Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Customer:</span> {invoice.repairOrder.customer.name}
            </div>
            {invoice.repairOrder.vehicle && (
              <>
                <div>
                  <span className="text-sm font-medium">Vehicle:</span>{" "}
                  {invoice.repairOrder.vehicle.make} {invoice.repairOrder.vehicle.model}
                </div>
                <div>
                  <span className="text-sm font-medium">VIN:</span> {invoice.repairOrder.vehicle.vin}
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
            {invoice.repairOrder.laborLines.length === 0 ? (
              <p className="text-sm text-gray-600">No labor lines</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tech</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.repairOrder.laborLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.tech?.name || "Unassigned"}</TableCell>
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
            {invoice.repairOrder.partLines.length === 0 ? (
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
                  {invoice.repairOrder.partLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.part?.description || "Custom Part"}</TableCell>
                      <TableCell>{line.qty}</TableCell>
                      <TableCell>${line.unitPrice.toString()}</TableCell>
                      <TableCell>
                        ${(Number(line.qty) * Number(line.unitPrice)).toFixed(2)}
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
            {invoice.payments.length === 0 ? (
              <p className="text-sm text-gray-600">No payments recorded</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.paidAt).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                      <TableCell>{payment.reference || "—"}</TableCell>
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
