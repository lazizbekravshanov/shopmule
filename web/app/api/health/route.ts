import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: "unknown",
    },
  }

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    health.checks.database = "healthy"
  } catch {
    health.checks.database = "unhealthy"
    health.status = "degraded"
  }

  const statusCode = health.status === "healthy" ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
