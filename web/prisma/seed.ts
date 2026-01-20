import { PrismaClient, Role, RepairOrderStatus, EstimateStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create shop
  let shop = await prisma.shop.findUnique({
    where: { slug: "demo-fleet" },
  })

  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        name: "Demo Fleet",
        slug: "demo-fleet",
      },
    })
  }

  console.log("Created shop:", shop.name)

  // Create users
  const passwordHash = await bcrypt.hash("admin123", 12)

  let admin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  })
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        passwordHash,
        name: "Admin User",
        phone: "555-0100",
        role: Role.ADMIN,
        shopId: shop.id,
      },
    })
  }

  const writerPassword = await bcrypt.hash("writer123", 12)
  let writer = await prisma.user.findUnique({
    where: { email: "writer@example.com" },
  })
  if (!writer) {
    writer = await prisma.user.create({
      data: {
        email: "writer@example.com",
        passwordHash: writerPassword,
        name: "Service Writer",
        phone: "555-0101",
        role: Role.MANAGER,
        shopId: shop.id,
      },
    })
  }

  const techPassword = await bcrypt.hash("tech123", 12)
  let tech = await prisma.user.findUnique({
    where: { email: "tech@example.com" },
  })
  if (!tech) {
    tech = await prisma.user.create({
      data: {
        email: "tech@example.com",
        passwordHash: techPassword,
        name: "Technician",
        phone: "555-0102",
        role: Role.TECH,
        shopId: shop.id,
      },
    })
  }

  console.log("Created users:", admin.email, writer.email, tech.email)

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      shopId: shop.id,
      name: "Acme Logistics",
      phone: "555-0200",
      email: "contact@acme-logistics.com",
      billingTerms: "Net 30",
    },
  })

  console.log("Created customer:", customer.name)

  // Create vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      shopId: shop.id,
      customerId: customer.id,
      vin: "1HGBH41JXMN109186",
      make: "Volvo",
      model: "VNL",
      year: 2020,
      plate: "TRK-100",
      odometer: 125000,
      engineHours: 5000,
    },
  })

  console.log("Created vehicle:", vehicle.vin)

  // Create part
  const part = await prisma.part.create({
    data: {
      shopId: shop.id,
      sku: "BRK-001",
      description: "Brake Pad Set",
      vendor: "FleetParts Inc",
      cost: 200.0,
      price: 350.0,
      qtyOnHand: 10,
      reorderPoint: 3,
      binLocation: "A1",
    },
  })

  console.log("Created part:", part.sku)

  // Create repair order
  const repairOrder = await prisma.repairOrder.create({
    data: {
      shopId: shop.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      status: RepairOrderStatus.AWAITING_APPROVAL,
      internalNotes: "Brake inspection required",
      customerNotes: "Customer reports squeaking noise when braking",
    },
  })

  console.log("Created repair order:", repairOrder.id)

  // Create labor line
  await prisma.laborLine.create({
    data: {
      shopId: shop.id,
      repairOrderId: repairOrder.id,
      techId: tech.id,
      hours: 2.5,
      rate: 120.0,
      description: "Brake inspection and diagnosis",
      billedHours: 0,
    },
  })

  // Create part line
  await prisma.partLine.create({
    data: {
      shopId: shop.id,
      repairOrderId: repairOrder.id,
      partId: part.id,
      qty: 2,
      unitCost: 200.0,
      unitPrice: 350.0,
      taxable: true,
    },
  })

  // Create estimate
  await prisma.estimate.create({
    data: {
      shopId: shop.id,
      repairOrderId: repairOrder.id,
      status: EstimateStatus.PENDING,
      total: 1200.0,
    },
  })

  // Create display token for TV dashboard
  const displayToken = await prisma.displayToken.create({
    data: {
      shopId: shop.id,
      tokenHash: "", // Will be generated via API
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })

  console.log("Created display token:", displayToken.id)

  console.log("\n✅ Seed completed!")
  console.log("\nDefault login credentials:")
  console.log("  Admin: admin@example.com / admin123")
  console.log("  Writer: writer@example.com / writer123")
  console.log("  Tech: tech@example.com / tech123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
