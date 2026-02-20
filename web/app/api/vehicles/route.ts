import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantId = session.user.tenantId
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId")

  const vehicles = await prisma.vehicle.findMany({
    where: { tenantId, ...(customerId ? { customerId } : {}) },
    orderBy: { vin: "asc" },
    include: {
      Customer: true,
    },
  })

  return NextResponse.json(vehicles)
}
