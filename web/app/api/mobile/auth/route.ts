import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.warn("Warning: JWT_SECRET not configured for mobile auth")
}

export async function POST(request: Request) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "Authentication not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const normalizedEmail = email.trim().toLowerCase()

    // Find user with employee profile
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        EmployeeProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.EmployeeProfile?.id,
      },
      JWT_SECRET,
      {
        expiresIn: "30d", // Long-lived token for mobile
      }
    )

    // Return token and user info (use employeeId for time clock)
    return NextResponse.json({
      token,
      user: {
        id: user.EmployeeProfile?.id || user.id, // Use employeeId for attendance APIs
        odid: user.id,
        email: user.email,
        role: user.role,
        name: user.EmployeeProfile?.name,
      },
    })
  } catch (error) {
    console.error("Mobile auth error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}
