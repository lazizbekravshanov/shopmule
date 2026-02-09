import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const debug = {
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlStart: process.env.DATABASE_URL?.substring(0, 50) + "...",
      nodeEnv: process.env.NODE_ENV,
    },
    dbTest: "not tested",
    error: null as string | null,
  }

  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    debug.dbTest = "success"
  } catch (e: unknown) {
    debug.dbTest = "failed"
    debug.error = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json(debug)
}
