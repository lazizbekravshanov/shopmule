import { requireAuth } from "@/lib/rbac"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function RepairOrdersPage() {
  const session = await requireAuth()
  const shopId = session.user.shopId

  const repairOrders = await prisma.repairOrder.findMany({
    where: { shopId },
    include: {
      customer: true,
      vehicle: true,
    },
    orderBy: { openedAt: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Repair Orders</h1>
          <p className="text-gray-600 mt-1">Manage repair orders</p>
        </div>
        <Link href="/repair-orders/new">
          <Button>New Repair Order</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Repair Orders</CardTitle>
          <CardDescription>View and manage repair orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RO #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairOrders.map((ro) => (
                <TableRow key={ro.id}>
                  <TableCell className="font-medium">RO-{ro.id.slice(0, 8)}</TableCell>
                  <TableCell>{ro.customer.name}</TableCell>
                  <TableCell>
                    {ro.vehicle
                      ? `${ro.vehicle.make} ${ro.vehicle.model} (${ro.vehicle.vin.slice(0, 8)})`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                      {ro.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(ro.openedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`/repair-orders/${ro.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
