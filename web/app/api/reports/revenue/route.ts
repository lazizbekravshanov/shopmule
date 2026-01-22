import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const start = from ? new Date(from) : new Date("1970-01-01")
    const end = to ? new Date(to) : new Date()

    const result = await prisma.invoice.aggregate({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        _all: true,
      },
    })

    return NextResponse.json({
      total: result._sum.total ?? 0,
      count: result._count._all,
    })
  } catch (error) {
    console.error("Error fetching revenue report:", error)
    return NextResponse.json(
      { error: "Failed to fetch revenue report" },
      { status: 500 }
    )
  }
}
