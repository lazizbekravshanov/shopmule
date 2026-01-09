import { requireAuth } from "@/lib/rbac"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RepairOrderStatus } from "@prisma/client"

export default async function DashboardPage() {
  const session = await requireAuth()
  const shopId = session.user.shopId

  const [
    activeOrders,
    todayPunches,
    todayEntries,
    recentInvoices,
  ] = await Promise.all([
    prisma.repairOrder.count({
      where: {
        shopId,
        status: RepairOrderStatus.IN_PROGRESS,
      },
    }),
    prisma.shiftPunch.count({
      where: {
        shopId,
        clockOutAt: null,
      },
    }),
    prisma.timeEntry.count({
      where: {
        shopId,
        clockOut: null,
      },
    }),
    prisma.invoice.findMany({
      where: { shopId },
      orderBy: { issuedAt: "desc" },
      take: 5,
      include: {
        repairOrder: {
          include: {
            customer: true,
          },
        },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {session.user.name || session.user.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Repair Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clocked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPunches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEntries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentInvoices.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Latest invoices issued</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Invoice #{invoice.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">{invoice.repairOrder.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${invoice.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
