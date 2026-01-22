import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  contactName: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  billingAddress: z.string().max(500).optional().nullable(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("GET /api/customers - session:", session ? "exists" : "null")

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        Vehicle: true,
      },
    })

    const transformed = customers.map((c) => ({
      id: c.id,
      name: c.name,
      contactName: c.contactName,
      phone: c.phone,
      email: c.email,
      billingAddress: c.billingAddress,
      vehicles: c.Vehicle.map((v) => ({
        id: v.id,
        vin: v.vin,
        unitNumber: v.unitNumber,
        make: v.make,
        model: v.model,
        year: v.year,
        mileage: v.mileage,
        licensePlate: v.licensePlate,
        customerId: v.customerId,
      })),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("GET /api/customers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("POST /api/customers - session:", session ? "exists" : "null")

    if (!session) {
      console.log("POST /api/customers - Unauthorized, no session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("POST /api/customers - body:", body)

    const parsed = createCustomerSchema.safeParse(body)
    if (!parsed.success) {
      console.log("POST /api/customers - validation error:", parsed.error.flatten())
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        contactName: data.contactName || null,
        phone: data.phone || null,
        email: data.email || null,
        billingAddress: data.billingAddress || null,
      },
    })

    console.log("POST /api/customers - created customer:", customer.id)

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      contactName: customer.contactName,
      phone: customer.phone,
      email: customer.email,
      billingAddress: customer.billingAddress,
      vehicles: [],
    }, { status: 201 })
  } catch (error) {
    console.error("POST /api/customers error:", error)
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    )
  }
}
