import { PrismaClient, Role, WorkOrderStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

  // Create admin user
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    })
    console.log("Created admin user:", admin.email)

    // Create employee profile for admin
    await prisma.employeeProfile.create({
      data: {
        userId: admin.id,
        name: "Admin User",
        role: Role.ADMIN,
        payRate: 0,
      },
    })
  } else {
    // Update existing admin password if environment variable is set
    if (process.env.ADMIN_PASSWORD) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { passwordHash },
      })
      console.log("Updated admin user password:", admin.email)
    }
  }

  // Create mechanic user
  const mechPassword = await bcrypt.hash("mechanic123", 12)
  let mechanic = await prisma.user.findUnique({
    where: { email: "mechanic@example.com" },
  })

  if (!mechanic) {
    mechanic = await prisma.user.create({
      data: {
        email: "mechanic@example.com",
        passwordHash: mechPassword,
        role: Role.MECHANIC,
      },
    })
    console.log("Created mechanic user:", mechanic.email)

    await prisma.employeeProfile.create({
      data: {
        userId: mechanic.id,
        name: "John Mechanic",
        role: Role.MECHANIC,
        payRate: 35.0,
      },
    })
  }

  // Create sample customers with vehicles
  const customersData = [
    {
      name: "Acme Logistics",
      contactName: "John Smith",
      phone: "555-0100",
      email: "john@acmelogistics.com",
      billingAddress: "123 Industrial Way, Chicago, IL 60601",
      vehicles: [
        { vin: "1HGBH41JXMN109186", make: "Volvo", model: "VNL 860", year: 2022, mileage: 125000, licensePlate: "TRK-100" },
        { vin: "2HGBH41JXMN109187", make: "Freightliner", model: "Cascadia", year: 2021, mileage: 98000, licensePlate: "TRK-101" },
      ],
    },
    {
      name: "FastTrack Delivery",
      contactName: "Sarah Johnson",
      phone: "555-0200",
      email: "sarah@fasttrack.com",
      billingAddress: "456 Commerce Blvd, Detroit, MI 48201",
      vehicles: [
        { vin: "3HGBH41JXMN109188", make: "Peterbilt", model: "579", year: 2023, mileage: 45000, licensePlate: "FTD-001" },
        { vin: "4HGBH41JXMN109189", make: "Kenworth", model: "T680", year: 2020, mileage: 210000, licensePlate: "FTD-002" },
      ],
    },
    {
      name: "Metro Transit Co",
      contactName: "Mike Davis",
      phone: "555-0300",
      email: "mike@metrotransit.com",
      billingAddress: "789 Transport Ave, Cleveland, OH 44101",
      vehicles: [
        { vin: "5HGBH41JXMN109190", make: "International", model: "LT", year: 2021, mileage: 156000, licensePlate: "MTC-500" },
      ],
    },
  ]

  for (const customerData of customersData) {
    const { vehicles, ...custData } = customerData

    let customer = await prisma.customer.findFirst({
      where: { email: custData.email },
    })

    if (!customer) {
      customer = await prisma.customer.create({ data: custData })
      console.log("Created customer:", customer.name)

      for (const vehicleData of vehicles) {
        const vehicle = await prisma.vehicle.create({
          data: {
            ...vehicleData,
            customerId: customer.id,
          },
        })
        console.log("  Created vehicle:", vehicle.make, vehicle.model)
      }
    }
  }

  // Create sample work orders
  const firstCustomer = await prisma.customer.findFirst({
    include: { Vehicle: true },
  })

  if (firstCustomer && firstCustomer.Vehicle.length > 0) {
    const existingWO = await prisma.workOrder.count()

    if (existingWO === 0) {
      const workOrdersData = [
        {
          vehicleId: firstCustomer.Vehicle[0].id,
          description: "Brake inspection and service - customer reports squeaking noise",
          status: WorkOrderStatus.DIAGNOSED,
        },
        {
          vehicleId: firstCustomer.Vehicle[1]?.id || firstCustomer.Vehicle[0].id,
          description: "Oil change and filter replacement - routine maintenance",
          status: WorkOrderStatus.IN_PROGRESS,
        },
      ]

      for (const woData of workOrdersData) {
        const wo = await prisma.workOrder.create({ data: woData })
        console.log("Created work order:", wo.id)
      }
    }
  }

  // Create sample parts
  const partsData = [
    { sku: "BRK-001", name: "Brake Pad Set - Heavy Duty", category: "Brakes", cost: 200.0, price: 350.0, stock: 10, reorderPoint: 3 },
    { sku: "OIL-001", name: "Synthetic Motor Oil 15W-40 (Gallon)", category: "Fluids", cost: 25.0, price: 45.0, stock: 50, reorderPoint: 10 },
    { sku: "FLT-001", name: "Oil Filter - Heavy Duty", category: "Filters", cost: 15.0, price: 30.0, stock: 25, reorderPoint: 5 },
    { sku: "AIR-001", name: "Air Filter - Truck", category: "Filters", cost: 35.0, price: 65.0, stock: 15, reorderPoint: 3 },
  ]

  for (const partData of partsData) {
    const existingPart = await prisma.part.findUnique({
      where: { sku: partData.sku },
    })

    if (!existingPart) {
      const part = await prisma.part.create({ data: partData })
      console.log("Created part:", part.name)
    }
  }

  const adminEmailDisplay = process.env.ADMIN_EMAIL || "admin@example.com"
  console.log("\n✅ Seed completed!")
  console.log("\nLogin credentials:")
  console.log(`  Admin: ${adminEmailDisplay} / [from ADMIN_PASSWORD env var]`)
  console.log("  Mechanic: mechanic@example.com / mechanic123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
