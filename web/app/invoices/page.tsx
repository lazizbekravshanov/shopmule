import { requireAuth } from "@/lib/rbac"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function InvoicesPage() {
  const session = await requireAuth()
  const shopId = session.user.shopId

  const invoices = await prisma.invoice.findMany({
    where: { shopId },
    include: {
      repairOrder: {
        include: {
          customer: true,
        },
      },
      payments: true,
    },
    orderBy: { issuedAt: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-gray-600 mt-1">View and manage invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>View invoice status and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Repair Order</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const paidAmount = invoice.payments.reduce(
                  (sum, p) => sum + Number(p.amount),
                  0
                )
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      INV-{invoice.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{invoice.repairOrder.customer.name}</TableCell>
                    <TableCell>
                      <Link
                        href={`/repair-orders/${invoice.repairOrder.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        RO-{invoice.repairOrder.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>${Number(invoice.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "PARTIALLY_PAID"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100"
                        }`}
                      >
                        {invoice.status} {paidAmount > 0 && `($${paidAmount.toFixed(2)})`}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(invoice.issuedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Link href={`/invoices/${invoice.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
