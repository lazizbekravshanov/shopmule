import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const customers = await prisma.customer.findMany({
    where: { shopId: session.user.shopId },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(customers)
}
