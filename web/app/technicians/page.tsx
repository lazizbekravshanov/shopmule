import { requireAuth } from "@/lib/rbac"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Role } from "@prisma/client"

export default async function TechniciansPage() {
  const session = await requireAuth()
  const shopId = session.user.shopId

  const technicians = await prisma.user.findMany({
    where: {
      shopId,
      role: Role.TECH,
    },
    include: {
      shiftPunches: {
        where: {
          clockOutAt: null,
        },
        take: 1,
      },
      timeEntries: {
        where: {
          clockOut: null,
        },
        take: 1,
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Technicians</h1>
        <p className="text-gray-600 mt-1">View technician status and activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Technicians</CardTitle>
          <CardDescription>Current technicians and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active Time Entry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell className="font-medium">{tech.name || tech.email}</TableCell>
                  <TableCell>{tech.email}</TableCell>
                  <TableCell>{tech.phone || "N/A"}</TableCell>
                  <TableCell>
                    {tech.shiftPunches.length > 0 ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Clocked In
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        Clocked Out
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tech.timeEntries.length > 0 ? (
                      <span className="text-sm text-blue-600">Active</span>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
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
