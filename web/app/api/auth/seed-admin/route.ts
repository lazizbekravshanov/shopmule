import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: {
        email,
        passwordHash,
        role: "ADMIN",
      },
    })

    return NextResponse.json({ id: user.id, email: user.email })
  } catch (error) {
    console.error("Seed admin error:", error)
    return NextResponse.json(
      { error: "Failed to seed admin" },
      { status: 500 }
    )
  }
}
