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
    const countOnly = searchParams.get("countOnly") === "true"

    const parts = await prisma.part.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        reorderPoint: true,
      },
    })

    const lowStock = parts.filter(
      (part) => part.reorderPoint > 0 && part.stock <= part.reorderPoint
    )

    if (countOnly) {
      return NextResponse.json({ count: lowStock.length })
    }

    return NextResponse.json(lowStock)
  } catch (error) {
    console.error("Error fetching low stock parts:", error)
    return NextResponse.json(
      { error: "Failed to fetch low stock parts" },
      { status: 500 }
    )
  }
}
