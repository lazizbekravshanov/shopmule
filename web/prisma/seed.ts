import { PrismaClient, Role, WorkOrderStatus, CustomerType, CustomerSource, PaymentTerms, InvoiceStatus, AppointmentStatus, AppointmentType, PartStatus, LineItemType, LineItemStatus, WorkOrderPriority, PunchMethod, PayType, DeductionType } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting comprehensive seed...")

  // ==========================================
  // TENANT
  // ==========================================
  const tenant = await prisma.tenant.create({
    data: {
      name: "ShopMule Demo Shop",
      slug: "demo-shop",
      address: "1234 Auto Repair Lane",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      phone: "555-SHOP-001",
      email: "info@shopmule-demo.com",
      website: "https://shopmule-demo.com",
      timezone: "America/Chicago",
      taxRate: 0.0825,
      settings: {
        bayCount: 8,
        businessHours: {
          monday: { open: "07:00", close: "18:00" },
          tuesday: { open: "07:00", close: "18:00" },
          wednesday: { open: "07:00", close: "18:00" },
          thursday: { open: "07:00", close: "18:00" },
          friday: { open: "07:00", close: "18:00" },
          saturday: { open: "08:00", close: "14:00" },
          sunday: { open: null, close: null },
        },
        defaultLaborRate: 125,
        defaultPaymentTerms: "DUE_ON_RECEIPT",
      },
    },
  })
  console.log("Created tenant:", tenant.name)

  // ==========================================
  // USERS & EMPLOYEE PROFILES
  // ==========================================
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@shopmule.com").trim()
  const adminPassword = (process.env.ADMIN_PASSWORD || "admin123").trim()

  // Admin/Owner
  const adminHash = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: adminEmail,
      passwordHash: adminHash,
      name: "Mike Owner",
      role: Role.OWNER,
    },
  })
  await prisma.employeeProfile.create({
    data: {
      tenantId: tenant.id,
      userId: admin.id,
      name: "Mike Owner",
      role: Role.OWNER,
      payRate: 0,
      status: "active",
    },
  })
  console.log("Created admin:", admin.email)

  // Service Advisors
  const saHash = await bcrypt.hash("advisor123", 12)
  const serviceAdvisor1 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "sarah@shopmule.com",
      passwordHash: saHash,
      name: "Sarah Advisor",
      role: Role.SERVICE_ADVISOR,
    },
  })
  const saProfile1 = await prisma.employeeProfile.create({
    data: {
      tenantId: tenant.id,
      userId: serviceAdvisor1.id,
      name: "Sarah Advisor",
      role: Role.SERVICE_ADVISOR,
      payRate: 25,
      status: "active",
    },
  })

  const serviceAdvisor2 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "tom@shopmule.com",
      passwordHash: saHash,
      name: "Tom Advisor",
      role: Role.SERVICE_ADVISOR,
    },
  })
  await prisma.employeeProfile.create({
    data: {
      tenantId: tenant.id,
      userId: serviceAdvisor2.id,
      name: "Tom Advisor",
      role: Role.SERVICE_ADVISOR,
      payRate: 24,
      status: "active",
    },
  })
  console.log("Created service advisors")

  // Service Manager
  const smHash = await bcrypt.hash("manager123", 12)
  const serviceManager = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "lisa@shopmule.com",
      passwordHash: smHash,
      name: "Lisa Service Manager",
      role: Role.SERVICE_MANAGER,
    },
  })
  await prisma.employeeProfile.create({
    data: {
      tenantId: tenant.id,
      userId: serviceManager.id,
      name: "Lisa Service Manager",
      role: Role.SERVICE_MANAGER,
      payRate: 30,
      status: "active",
    },
  })
  console.log("Created service manager")

  // Parts Manager
  const pmHash = await bcrypt.hash("parts123", 12)
  const partsManager = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "rick@shopmule.com",
      passwordHash: pmHash,
      name: "Rick Parts Manager",
      role: Role.PARTS_MANAGER,
    },
  })
  await prisma.employeeProfile.create({
    data: {
      tenantId: tenant.id,
      userId: partsManager.id,
      name: "Rick Parts Manager",
      role: Role.PARTS_MANAGER,
      payRate: 26,
      status: "active",
    },
  })
  console.log("Created parts manager")

  // Mechanics/Technicians
  const mechHash = await bcrypt.hash("mechanic123", 12)
  const techNames = [
    { name: "John Martinez", email: "john@shopmule.com", rate: 35, specializations: ["Diesel", "Heavy Duty", "Electrical"], payType: PayType.HOURLY, hireDate: new Date("2022-03-15"), phone: "555-TECH-001" },
    { name: "Carlos Rodriguez", email: "carlos@shopmule.com", rate: 32, specializations: ["Brakes", "Suspension", "Alignment"], payType: PayType.HOURLY, hireDate: new Date("2022-06-01"), phone: "555-TECH-002" },
    { name: "Mike Chen", email: "mike.c@shopmule.com", rate: 30, specializations: ["Engine", "Transmission", "Diagnostics"], payType: PayType.FLAT_RATE, hireDate: new Date("2023-01-10"), phone: "555-TECH-003" },
    { name: "David Kim", email: "david@shopmule.com", rate: 28, specializations: ["AC/Heating", "Electrical", "Hybrid"], payType: PayType.HOURLY, hireDate: new Date("2023-05-20"), phone: "555-TECH-004" },
    { name: "James Wilson", email: "james@shopmule.com", rate: 26, specializations: ["Oil Change", "Tires", "General Maintenance"], payType: PayType.HOURLY, hireDate: new Date("2024-02-01"), phone: "555-TECH-005" },
  ]

  const technicians: { id: string; name: string }[] = []
  for (const tech of techNames) {
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: tech.email,
        passwordHash: mechHash,
        name: tech.name,
        role: Role.MECHANIC,
        phone: tech.phone,
      },
    })
    const profile = await prisma.employeeProfile.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        name: tech.name,
        role: Role.MECHANIC,
        payRate: tech.rate,
        payType: tech.payType,
        overtimeRate: tech.rate * 1.5,
        status: "active",
        specializations: tech.specializations,
        hireDate: tech.hireDate,
        phoneNumber: tech.phone,
      },
    })
    technicians.push({ id: profile.id, name: tech.name })
  }
  console.log("Created", technicians.length, "technicians")

  // ==========================================
  // TECHNICIAN CERTIFICATIONS
  // ==========================================
  const certsData = [
    // John Martinez - Diesel specialist
    { employeeIdx: 0, name: "ASE T2 - Diesel Engines", issuingOrg: "ASE", certNumber: "ASE-T2-78432", level: "expert", issuedDate: new Date("2022-06-15"), expiryDate: new Date("2027-06-15") },
    { employeeIdx: 0, name: "ASE T4 - Brakes", issuingOrg: "ASE", certNumber: "ASE-T4-78433", level: "advanced", issuedDate: new Date("2023-01-10"), expiryDate: new Date("2028-01-10") },
    { employeeIdx: 0, name: "Cummins ISX Certified", issuingOrg: "Cummins", certNumber: "CUM-ISX-2201", level: "expert", issuedDate: new Date("2023-03-20"), expiryDate: new Date("2026-03-20") },
    // Carlos Rodriguez - Brakes/Suspension
    { employeeIdx: 1, name: "ASE A4 - Suspension & Steering", issuingOrg: "ASE", certNumber: "ASE-A4-65210", level: "expert", issuedDate: new Date("2022-08-01"), expiryDate: new Date("2027-08-01") },
    { employeeIdx: 1, name: "ASE A5 - Brakes", issuingOrg: "ASE", certNumber: "ASE-A5-65211", level: "advanced", issuedDate: new Date("2022-08-01"), expiryDate: new Date("2027-08-01") },
    { employeeIdx: 1, name: "Hunter Alignment Certified", issuingOrg: "Hunter Engineering", certNumber: "HEC-ALN-4401", level: "advanced", issuedDate: new Date("2023-09-15"), expiryDate: new Date("2025-09-15") },
    // Mike Chen - Engine/Transmission
    { employeeIdx: 2, name: "ASE A1 - Engine Repair", issuingOrg: "ASE", certNumber: "ASE-A1-91002", level: "expert", issuedDate: new Date("2023-04-01"), expiryDate: new Date("2028-04-01") },
    { employeeIdx: 2, name: "ASE A2 - Automatic Transmission", issuingOrg: "ASE", certNumber: "ASE-A2-91003", level: "advanced", issuedDate: new Date("2023-04-01"), expiryDate: new Date("2028-04-01") },
    // David Kim - AC/Electrical
    { employeeIdx: 3, name: "ASE A6 - Electrical/Electronic", issuingOrg: "ASE", certNumber: "ASE-A6-44501", level: "advanced", issuedDate: new Date("2023-07-10"), expiryDate: new Date("2028-07-10") },
    { employeeIdx: 3, name: "ASE A7 - Heating & AC", issuingOrg: "ASE", certNumber: "ASE-A7-44502", level: "advanced", issuedDate: new Date("2023-07-10"), expiryDate: new Date("2028-07-10") },
    { employeeIdx: 3, name: "EPA Section 608 Certification", issuingOrg: "EPA", certNumber: "EPA-608-UNV-8891", level: "expert", issuedDate: new Date("2022-01-15"), expiryDate: null },
    // James Wilson - General
    { employeeIdx: 4, name: "ASE G1 - Maintenance & Light Repair", issuingOrg: "ASE", certNumber: "ASE-G1-22100", level: "basic", issuedDate: new Date("2024-03-01"), expiryDate: new Date("2029-03-01") },
  ]

  for (const certData of certsData) {
    await prisma.technicianCertification.create({
      data: {
        employeeId: technicians[certData.employeeIdx].id,
        name: certData.name,
        issuingOrg: certData.issuingOrg,
        certNumber: certData.certNumber,
        level: certData.level,
        issuedDate: certData.issuedDate,
        expiryDate: certData.expiryDate,
        isActive: true,
      },
    })
  }
  console.log("Created", certsData.length, "technician certifications")

  // ==========================================
  // VENDORS
  // ==========================================
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        tenantId: tenant.id,
        name: "AutoZone Commercial",
        contact: "Bob Smith",
        phone: "555-AUTO-001",
        email: "commercial@autozone.com",
        paymentTerms: PaymentTerms.NET_30,
      },
    }),
    prisma.vendor.create({
      data: {
        tenantId: tenant.id,
        name: "NAPA Auto Parts",
        contact: "Lisa Johnson",
        phone: "555-NAPA-001",
        email: "fleet@napaonline.com",
        paymentTerms: PaymentTerms.NET_30,
      },
    }),
    prisma.vendor.create({
      data: {
        tenantId: tenant.id,
        name: "O'Reilly Auto Parts",
        contact: "Tim Davis",
        phone: "555-OREI-001",
        email: "pro@oreillyauto.com",
        paymentTerms: PaymentTerms.NET_15,
      },
    }),
  ])
  console.log("Created", vendors.length, "vendors")

  // ==========================================
  // FLEET ACCOUNTS
  // ==========================================
  const fleetAccounts = await Promise.all([
    prisma.fleetAccount.create({
      data: {
        tenantId: tenant.id,
        companyName: "Midwest Logistics Inc",
        accountNumber: "FA-0001",
        billingAddress: { street: "500 Industrial Pkwy", city: "Chicago", state: "IL", zip: "60601" },
        paymentTerms: PaymentTerms.NET_30,
        discountRatePercent: 10,
        creditLimit: 50000,
        autoApproveUnder: 1000,
        status: "ACTIVE",
      },
    }),
    prisma.fleetAccount.create({
      data: {
        tenantId: tenant.id,
        companyName: "FastTrack Delivery Services",
        accountNumber: "FA-0002",
        billingAddress: { street: "200 Commerce Blvd", city: "Detroit", state: "MI", zip: "48201" },
        paymentTerms: PaymentTerms.NET_45,
        discountRatePercent: 15,
        creditLimit: 75000,
        autoApproveUnder: 2000,
        status: "ACTIVE",
      },
    }),
    prisma.fleetAccount.create({
      data: {
        tenantId: tenant.id,
        companyName: "City Transit Authority",
        accountNumber: "FA-0003",
        billingAddress: { street: "1 Government Plaza", city: "Chicago", state: "IL", zip: "60602" },
        paymentTerms: PaymentTerms.NET_60,
        discountRatePercent: 12,
        creditLimit: 100000,
        autoApproveUnder: 5000,
        status: "ACTIVE",
      },
    }),
  ])
  console.log("Created", fleetAccounts.length, "fleet accounts")

  // ==========================================
  // CUSTOMERS (12 total: 9 individual + 3 fleet contacts)
  // ==========================================
  const customersData = [
    // Individual customers
    { type: CustomerType.INDIVIDUAL, firstName: "Robert", lastName: "Johnson", displayName: "Robert Johnson", name: "Robert Johnson", phone: "555-0101", email: "robert.johnson@email.com", source: CustomerSource.WALK_IN },
    { type: CustomerType.INDIVIDUAL, firstName: "Maria", lastName: "Garcia", displayName: "Maria Garcia", name: "Maria Garcia", phone: "555-0102", email: "maria.garcia@email.com", source: CustomerSource.REFERRAL },
    { type: CustomerType.INDIVIDUAL, firstName: "William", lastName: "Brown", displayName: "William Brown", name: "William Brown", phone: "555-0103", email: "william.brown@email.com", source: CustomerSource.WEBSITE },
    { type: CustomerType.INDIVIDUAL, firstName: "Jennifer", lastName: "Davis", displayName: "Jennifer Davis", name: "Jennifer Davis", phone: "555-0104", email: "jennifer.davis@email.com", source: CustomerSource.PHONE },
    { type: CustomerType.INDIVIDUAL, firstName: "Michael", lastName: "Miller", displayName: "Michael Miller", name: "Michael Miller", phone: "555-0105", email: "michael.miller@email.com", source: CustomerSource.MARKETING },
    { type: CustomerType.INDIVIDUAL, firstName: "Linda", lastName: "Wilson", displayName: "Linda Wilson", name: "Linda Wilson", phone: "555-0106", email: "linda.wilson@email.com", source: CustomerSource.WALK_IN },
    { type: CustomerType.INDIVIDUAL, firstName: "James", lastName: "Moore", displayName: "James Moore", name: "James Moore", phone: "555-0107", email: "james.moore@email.com", source: CustomerSource.REFERRAL },
    { type: CustomerType.INDIVIDUAL, firstName: "Patricia", lastName: "Taylor", displayName: "Patricia Taylor", name: "Patricia Taylor", phone: "555-0108", email: "patricia.taylor@email.com", source: CustomerSource.WEBSITE },
    { type: CustomerType.INDIVIDUAL, firstName: "David", lastName: "Anderson", displayName: "David Anderson", name: "David Anderson", phone: "555-0109", email: "david.anderson@email.com", source: CustomerSource.WALK_IN },
    // Fleet contacts
    { type: CustomerType.FLEET, companyName: "Midwest Logistics Inc", displayName: "Midwest Logistics Inc", name: "Midwest Logistics Inc", contactName: "John Smith", phone: "555-0200", email: "john.smith@midwestlogistics.com", source: CustomerSource.FLEET, fleetAccountId: fleetAccounts[0].id },
    { type: CustomerType.FLEET, companyName: "FastTrack Delivery Services", displayName: "FastTrack Delivery Services", name: "FastTrack Delivery Services", contactName: "Sarah Johnson", phone: "555-0201", email: "sarah.johnson@fasttrack.com", source: CustomerSource.FLEET, fleetAccountId: fleetAccounts[1].id },
    { type: CustomerType.FLEET, companyName: "City Transit Authority", displayName: "City Transit Authority", name: "City Transit Authority", contactName: "Mike Davis", phone: "555-0202", email: "mike.davis@citytransit.gov", source: CustomerSource.FLEET, fleetAccountId: fleetAccounts[2].id },
  ]

  const customers: { id: string; name: string; fleetAccountId?: string | null }[] = []
  for (const custData of customersData) {
    const customer = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        ...custData,
      },
    })
    customers.push({ id: customer.id, name: customer.displayName, fleetAccountId: customer.fleetAccountId })
  }
  console.log("Created", customers.length, "customers")

  // ==========================================
  // VEHICLES (25 total)
  // ==========================================
  const vehiclesData = [
    // Individual customer vehicles
    { customerId: customers[0].id, vin: "1HGBH41JXMN109186", year: 2020, make: "Honda", model: "Accord", color: "Silver", licensePlate: "ABC-1234", currentMileage: 45000 },
    { customerId: customers[0].id, vin: "2HGBH41JXMN109187", year: 2018, make: "Toyota", model: "Camry", color: "Blue", licensePlate: "XYZ-5678", currentMileage: 78000 },
    { customerId: customers[1].id, vin: "3HGBH41JXMN109188", year: 2021, make: "Ford", model: "F-150", color: "Red", licensePlate: "DEF-9012", currentMileage: 32000 },
    { customerId: customers[2].id, vin: "4HGBH41JXMN109189", year: 2019, make: "Chevrolet", model: "Silverado", color: "Black", licensePlate: "GHI-3456", currentMileage: 56000 },
    { customerId: customers[3].id, vin: "5HGBH41JXMN109190", year: 2022, make: "Tesla", model: "Model 3", color: "White", licensePlate: "JKL-7890", currentMileage: 15000 },
    { customerId: customers[4].id, vin: "6HGBH41JXMN109191", year: 2017, make: "BMW", model: "X5", color: "Gray", licensePlate: "MNO-1234", currentMileage: 89000 },
    { customerId: customers[5].id, vin: "7HGBH41JXMN109192", year: 2020, make: "Mercedes", model: "C300", color: "Black", licensePlate: "PQR-5678", currentMileage: 41000 },
    { customerId: customers[6].id, vin: "8HGBH41JXMN109193", year: 2019, make: "Audi", model: "A4", color: "Blue", licensePlate: "STU-9012", currentMileage: 52000 },
    { customerId: customers[7].id, vin: "9HGBH41JXMN109194", year: 2021, make: "Lexus", model: "RX350", color: "Pearl", licensePlate: "VWX-3456", currentMileage: 28000 },
    { customerId: customers[8].id, vin: "0HGBH41JXMN109195", year: 2018, make: "Subaru", model: "Outback", color: "Green", licensePlate: "YZA-7890", currentMileage: 67000 },
    // Fleet vehicles - Midwest Logistics (5 trucks)
    { customerId: customers[9].id, fleetAccountId: fleetAccounts[0].id, vin: "1FUJA6CV77LK39102", year: 2022, make: "Freightliner", model: "Cascadia", unitNumber: "ML-001", licensePlate: "TRK-0001", currentMileage: 125000 },
    { customerId: customers[9].id, fleetAccountId: fleetAccounts[0].id, vin: "1FUJA6CV77LK39103", year: 2021, make: "Freightliner", model: "Cascadia", unitNumber: "ML-002", licensePlate: "TRK-0002", currentMileage: 189000 },
    { customerId: customers[9].id, fleetAccountId: fleetAccounts[0].id, vin: "1FUJA6CV77LK39104", year: 2023, make: "Volvo", model: "VNL 860", unitNumber: "ML-003", licensePlate: "TRK-0003", currentMileage: 45000 },
    { customerId: customers[9].id, fleetAccountId: fleetAccounts[0].id, vin: "1FUJA6CV77LK39105", year: 2020, make: "Kenworth", model: "T680", unitNumber: "ML-004", licensePlate: "TRK-0004", currentMileage: 210000 },
    { customerId: customers[9].id, fleetAccountId: fleetAccounts[0].id, vin: "1FUJA6CV77LK39106", year: 2022, make: "Peterbilt", model: "579", unitNumber: "ML-005", licensePlate: "TRK-0005", currentMileage: 98000 },
    // Fleet vehicles - FastTrack Delivery (5 vans)
    { customerId: customers[10].id, fleetAccountId: fleetAccounts[1].id, vin: "2FMZA5148YBA51789", year: 2023, make: "Ford", model: "Transit 350", unitNumber: "FT-001", licensePlate: "VAN-0001", currentMileage: 35000 },
    { customerId: customers[10].id, fleetAccountId: fleetAccounts[1].id, vin: "2FMZA5148YBA51790", year: 2022, make: "Ford", model: "Transit 350", unitNumber: "FT-002", licensePlate: "VAN-0002", currentMileage: 62000 },
    { customerId: customers[10].id, fleetAccountId: fleetAccounts[1].id, vin: "2FMZA5148YBA51791", year: 2023, make: "Mercedes", model: "Sprinter 2500", unitNumber: "FT-003", licensePlate: "VAN-0003", currentMileage: 28000 },
    { customerId: customers[10].id, fleetAccountId: fleetAccounts[1].id, vin: "2FMZA5148YBA51792", year: 2021, make: "Ram", model: "ProMaster 2500", unitNumber: "FT-004", licensePlate: "VAN-0004", currentMileage: 89000 },
    { customerId: customers[10].id, fleetAccountId: fleetAccounts[1].id, vin: "2FMZA5148YBA51793", year: 2022, make: "Chevrolet", model: "Express 3500", unitNumber: "FT-005", licensePlate: "VAN-0005", currentMileage: 71000 },
    // Fleet vehicles - City Transit (5 buses)
    { customerId: customers[11].id, fleetAccountId: fleetAccounts[2].id, vin: "3VWCA21C5WM056123", year: 2020, make: "Blue Bird", model: "Vision", unitNumber: "CT-001", licensePlate: "BUS-0001", currentMileage: 156000 },
    { customerId: customers[11].id, fleetAccountId: fleetAccounts[2].id, vin: "3VWCA21C5WM056124", year: 2019, make: "Blue Bird", model: "Vision", unitNumber: "CT-002", licensePlate: "BUS-0002", currentMileage: 198000 },
    { customerId: customers[11].id, fleetAccountId: fleetAccounts[2].id, vin: "3VWCA21C5WM056125", year: 2021, make: "Thomas", model: "Saf-T-Liner", unitNumber: "CT-003", licensePlate: "BUS-0003", currentMileage: 87000 },
    { customerId: customers[11].id, fleetAccountId: fleetAccounts[2].id, vin: "3VWCA21C5WM056126", year: 2022, make: "IC Bus", model: "CE Series", unitNumber: "CT-004", licensePlate: "BUS-0004", currentMileage: 45000 },
    { customerId: customers[11].id, fleetAccountId: fleetAccounts[2].id, vin: "3VWCA21C5WM056127", year: 2018, make: "Blue Bird", model: "All American", unitNumber: "CT-005", licensePlate: "BUS-0005", currentMileage: 234000 },
  ]

  const vehicles: { id: string; make: string; model: string; customerId: string; fleetAccountId?: string | null }[] = []
  for (const vehData of vehiclesData) {
    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        ...vehData,
      },
    })
    vehicles.push({ id: vehicle.id, make: vehicle.make, model: vehicle.model, customerId: vehicle.customerId, fleetAccountId: vehicle.fleetAccountId })
  }
  console.log("Created", vehicles.length, "vehicles")

  // ==========================================
  // PARTS (50 items)
  // ==========================================
  const partsData = [
    // Brakes
    { partNumber: "BRK-001", sku: "BRK-PAD-HD", name: "Brake Pad Set - Heavy Duty", category: "Brakes", brand: "Wagner", cost: 85, price: 150, qtyOnHand: 24, reorderPoint: 5 },
    { partNumber: "BRK-002", sku: "BRK-ROT-FR", name: "Brake Rotor - Front", category: "Brakes", brand: "ACDelco", cost: 65, price: 120, qtyOnHand: 16, reorderPoint: 4 },
    { partNumber: "BRK-003", sku: "BRK-ROT-RR", name: "Brake Rotor - Rear", category: "Brakes", brand: "ACDelco", cost: 55, price: 100, qtyOnHand: 12, reorderPoint: 4 },
    { partNumber: "BRK-004", sku: "BRK-CAL-FR", name: "Brake Caliper - Front", category: "Brakes", brand: "Cardone", cost: 120, price: 220, qtyOnHand: 8, reorderPoint: 2 },
    { partNumber: "BRK-005", sku: "BRK-FLD-DOT4", name: "Brake Fluid DOT 4 (Qt)", category: "Brakes", brand: "Prestone", cost: 8, price: 15, qtyOnHand: 50, reorderPoint: 10 },
    // Fluids
    { partNumber: "FLD-001", sku: "OIL-SYN-5W30", name: "Synthetic Oil 5W-30 (Qt)", category: "Fluids", brand: "Mobil 1", cost: 9, price: 18, qtyOnHand: 120, reorderPoint: 24 },
    { partNumber: "FLD-002", sku: "OIL-SYN-0W20", name: "Synthetic Oil 0W-20 (Qt)", category: "Fluids", brand: "Mobil 1", cost: 10, price: 20, qtyOnHand: 96, reorderPoint: 24 },
    { partNumber: "FLD-003", sku: "OIL-DSL-15W40", name: "Diesel Oil 15W-40 (Gal)", category: "Fluids", brand: "Shell Rotella", cost: 28, price: 50, qtyOnHand: 40, reorderPoint: 10 },
    { partNumber: "FLD-004", sku: "ATF-DEX6", name: "ATF Dexron VI (Qt)", category: "Fluids", brand: "ACDelco", cost: 12, price: 22, qtyOnHand: 48, reorderPoint: 12 },
    { partNumber: "FLD-005", sku: "CLT-5050", name: "Coolant 50/50 (Gal)", category: "Fluids", brand: "Prestone", cost: 15, price: 28, qtyOnHand: 30, reorderPoint: 8 },
    // Filters
    { partNumber: "FLT-001", sku: "FLT-OIL-STD", name: "Oil Filter - Standard", category: "Filters", brand: "Fram", cost: 6, price: 12, qtyOnHand: 100, reorderPoint: 20 },
    { partNumber: "FLT-002", sku: "FLT-OIL-HD", name: "Oil Filter - Heavy Duty", category: "Filters", brand: "Wix", cost: 12, price: 25, qtyOnHand: 45, reorderPoint: 10 },
    { partNumber: "FLT-003", sku: "FLT-AIR-STD", name: "Air Filter - Standard", category: "Filters", brand: "K&N", cost: 25, price: 50, qtyOnHand: 35, reorderPoint: 8 },
    { partNumber: "FLT-004", sku: "FLT-AIR-HD", name: "Air Filter - Heavy Duty Truck", category: "Filters", brand: "Donaldson", cost: 45, price: 85, qtyOnHand: 20, reorderPoint: 5 },
    { partNumber: "FLT-005", sku: "FLT-FUEL-DSL", name: "Fuel Filter - Diesel", category: "Filters", brand: "Baldwin", cost: 35, price: 65, qtyOnHand: 18, reorderPoint: 4 },
    { partNumber: "FLT-006", sku: "FLT-CABIN", name: "Cabin Air Filter", category: "Filters", brand: "Fram", cost: 15, price: 30, qtyOnHand: 40, reorderPoint: 8 },
    // Electrical
    { partNumber: "ELC-001", sku: "BAT-STD-650", name: "Battery 650 CCA", category: "Electrical", brand: "Interstate", cost: 110, price: 180, qtyOnHand: 12, reorderPoint: 3 },
    { partNumber: "ELC-002", sku: "BAT-HD-950", name: "Battery 950 CCA Heavy Duty", category: "Electrical", brand: "Interstate", cost: 180, price: 300, qtyOnHand: 8, reorderPoint: 2 },
    { partNumber: "ELC-003", sku: "ALT-STD", name: "Alternator - Standard", category: "Electrical", brand: "Denso", cost: 150, price: 280, qtyOnHand: 6, reorderPoint: 2 },
    { partNumber: "ELC-004", sku: "STR-STD", name: "Starter Motor - Standard", category: "Electrical", brand: "Denso", cost: 180, price: 320, qtyOnHand: 5, reorderPoint: 2 },
    { partNumber: "ELC-005", sku: "SPK-PLAT", name: "Spark Plug - Platinum", category: "Electrical", brand: "NGK", cost: 8, price: 16, qtyOnHand: 80, reorderPoint: 16 },
    { partNumber: "ELC-006", sku: "SPK-IRID", name: "Spark Plug - Iridium", category: "Electrical", brand: "NGK", cost: 12, price: 24, qtyOnHand: 60, reorderPoint: 12 },
    // Suspension
    { partNumber: "SUS-001", sku: "SHK-FR-STD", name: "Shock Absorber - Front", category: "Suspension", brand: "Monroe", cost: 65, price: 120, qtyOnHand: 16, reorderPoint: 4 },
    { partNumber: "SUS-002", sku: "SHK-RR-STD", name: "Shock Absorber - Rear", category: "Suspension", brand: "Monroe", cost: 55, price: 100, qtyOnHand: 16, reorderPoint: 4 },
    { partNumber: "SUS-003", sku: "STR-ASM-FR", name: "Strut Assembly - Front", category: "Suspension", brand: "KYB", cost: 120, price: 220, qtyOnHand: 8, reorderPoint: 2 },
    { partNumber: "SUS-004", sku: "CTL-ARM-LW", name: "Control Arm - Lower", category: "Suspension", brand: "Moog", cost: 85, price: 160, qtyOnHand: 10, reorderPoint: 2 },
    { partNumber: "SUS-005", sku: "TIE-ROD-END", name: "Tie Rod End", category: "Suspension", brand: "Moog", cost: 35, price: 65, qtyOnHand: 20, reorderPoint: 4 },
    { partNumber: "SUS-006", sku: "BALL-JNT", name: "Ball Joint", category: "Suspension", brand: "Moog", cost: 45, price: 85, qtyOnHand: 16, reorderPoint: 4 },
    // Engine
    { partNumber: "ENG-001", sku: "WTR-PMP-STD", name: "Water Pump - Standard", category: "Engine", brand: "Gates", cost: 75, price: 140, qtyOnHand: 8, reorderPoint: 2 },
    { partNumber: "ENG-002", sku: "THM-HSG", name: "Thermostat Housing", category: "Engine", brand: "Dorman", cost: 45, price: 85, qtyOnHand: 10, reorderPoint: 2 },
    { partNumber: "ENG-003", sku: "TMG-BLT-KIT", name: "Timing Belt Kit", category: "Engine", brand: "Gates", cost: 180, price: 350, qtyOnHand: 4, reorderPoint: 1 },
    { partNumber: "ENG-004", sku: "SRP-BLT", name: "Serpentine Belt", category: "Engine", brand: "Gates", cost: 25, price: 50, qtyOnHand: 25, reorderPoint: 5 },
    { partNumber: "ENG-005", sku: "VLV-CVR-GSK", name: "Valve Cover Gasket", category: "Engine", brand: "Fel-Pro", cost: 35, price: 70, qtyOnHand: 15, reorderPoint: 3 },
    // AC/Heating
    { partNumber: "AC-001", sku: "AC-COMP-STD", name: "AC Compressor - Standard", category: "AC/Heating", brand: "Denso", cost: 280, price: 480, qtyOnHand: 4, reorderPoint: 1 },
    { partNumber: "AC-002", sku: "AC-COND", name: "AC Condenser", category: "AC/Heating", brand: "Spectra", cost: 150, price: 280, qtyOnHand: 5, reorderPoint: 1 },
    { partNumber: "AC-003", sku: "AC-R134A", name: "R134a Refrigerant (12oz)", category: "AC/Heating", brand: "Interdynamics", cost: 8, price: 18, qtyOnHand: 60, reorderPoint: 12 },
    { partNumber: "AC-004", sku: "HTR-CORE", name: "Heater Core", category: "AC/Heating", brand: "Spectra", cost: 85, price: 160, qtyOnHand: 3, reorderPoint: 1 },
    // Tires
    { partNumber: "TIR-001", sku: "TIR-AS-225", name: "All Season Tire 225/65R17", category: "Tires", brand: "Michelin", cost: 140, price: 220, qtyOnHand: 16, reorderPoint: 4, isTire: true, tireSize: "225/65R17" },
    { partNumber: "TIR-002", sku: "TIR-AS-265", name: "All Season Tire 265/70R17", category: "Tires", brand: "BFGoodrich", cost: 165, price: 260, qtyOnHand: 12, reorderPoint: 4, isTire: true, tireSize: "265/70R17" },
    { partNumber: "TIR-003", sku: "TIR-TRK-295", name: "Commercial Truck Tire 295/75R22.5", category: "Tires", brand: "Michelin", cost: 380, price: 550, qtyOnHand: 8, reorderPoint: 2, isTire: true, tireSize: "295/75R22.5" },
    // Exhaust
    { partNumber: "EXH-001", sku: "CAT-CONV-UNV", name: "Catalytic Converter - Universal", category: "Exhaust", brand: "MagnaFlow", cost: 280, price: 480, qtyOnHand: 3, reorderPoint: 1 },
    { partNumber: "EXH-002", sku: "MUF-STD", name: "Muffler - Standard", category: "Exhaust", brand: "Walker", cost: 85, price: 160, qtyOnHand: 8, reorderPoint: 2 },
    { partNumber: "EXH-003", sku: "O2-SENS", name: "O2 Sensor", category: "Exhaust", brand: "Bosch", cost: 55, price: 110, qtyOnHand: 12, reorderPoint: 3 },
    // Cooling
    { partNumber: "COL-001", sku: "RAD-STD", name: "Radiator - Standard", category: "Cooling", brand: "Spectra", cost: 180, price: 320, qtyOnHand: 4, reorderPoint: 1 },
    { partNumber: "COL-002", sku: "RAD-FAN", name: "Radiator Fan Assembly", category: "Cooling", brand: "Dorman", cost: 120, price: 220, qtyOnHand: 5, reorderPoint: 1 },
    { partNumber: "COL-003", sku: "RAD-HOSE-UP", name: "Radiator Hose - Upper", category: "Cooling", brand: "Gates", cost: 25, price: 50, qtyOnHand: 20, reorderPoint: 4 },
    { partNumber: "COL-004", sku: "RAD-HOSE-LW", name: "Radiator Hose - Lower", category: "Cooling", brand: "Gates", cost: 28, price: 55, qtyOnHand: 18, reorderPoint: 4 },
    // Transmission
    { partNumber: "TRN-001", sku: "CLT-KIT", name: "Clutch Kit", category: "Transmission", brand: "LuK", cost: 350, price: 580, qtyOnHand: 3, reorderPoint: 1 },
    { partNumber: "TRN-002", sku: "CV-AXLE-FR", name: "CV Axle - Front", category: "Transmission", brand: "GKN", cost: 120, price: 220, qtyOnHand: 6, reorderPoint: 2 },
    { partNumber: "TRN-003", sku: "TRN-MNT", name: "Transmission Mount", category: "Transmission", brand: "Anchor", cost: 45, price: 90, qtyOnHand: 10, reorderPoint: 2 },
  ]

  const parts: { id: string; name: string; sku: string; price: number }[] = []
  for (const partData of partsData) {
    const part = await prisma.part.create({
      data: {
        tenantId: tenant.id,
        ...partData,
        stock: partData.qtyOnHand, // Legacy field
        retailPrice: partData.price * 1.1,
      },
    })
    parts.push({ id: part.id, name: part.name, sku: part.sku, price: part.price })
  }
  console.log("Created", parts.length, "parts")

  // ==========================================
  // SERVICE TEMPLATES
  // ==========================================
  const serviceTemplates = await Promise.all([
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Oil Change - Standard",
        description: "Standard oil change with synthetic blend oil",
        category: "Maintenance",
        flatRatePrice: 49.99,
        laborHours: 0.5,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Oil Change - Full Synthetic",
        description: "Full synthetic oil change",
        category: "Maintenance",
        flatRatePrice: 79.99,
        laborHours: 0.5,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Brake Service - Front",
        description: "Front brake pad replacement with rotor inspection",
        category: "Brakes",
        flatRatePrice: 299.99,
        laborHours: 1.5,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Brake Service - Complete",
        description: "Front and rear brake pad and rotor replacement",
        category: "Brakes",
        flatRatePrice: 599.99,
        laborHours: 3.0,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Tire Rotation",
        description: "4-tire rotation with pressure check",
        category: "Tires",
        flatRatePrice: 29.99,
        laborHours: 0.3,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Wheel Alignment",
        description: "4-wheel alignment with printout",
        category: "Tires",
        flatRatePrice: 89.99,
        laborHours: 1.0,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "AC Service",
        description: "AC system inspection and recharge",
        category: "AC/Heating",
        flatRatePrice: 149.99,
        laborHours: 1.0,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Coolant Flush",
        description: "Complete cooling system flush and refill",
        category: "Cooling",
        flatRatePrice: 129.99,
        laborHours: 1.0,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "Transmission Service",
        description: "Transmission fluid flush and filter replacement",
        category: "Transmission",
        flatRatePrice: 199.99,
        laborHours: 1.5,
      },
    }),
    prisma.serviceTemplate.create({
      data: {
        tenantId: tenant.id,
        name: "DOT Inspection",
        description: "Commercial vehicle DOT safety inspection",
        category: "Inspection",
        flatRatePrice: 75.00,
        laborHours: 1.0,
      },
    }),
  ])
  console.log("Created", serviceTemplates.length, "service templates")

  // ==========================================
  // WORK ORDERS (20 with various statuses)
  // ==========================================
  const now = new Date()
  const oneDay = 24 * 60 * 60 * 1000
  let woCounter = 1

  const workOrdersData = [
    // Completed work orders (5)
    { vehicleIdx: 0, status: WorkOrderStatus.COMPLETED, description: "Oil change and tire rotation", daysAgo: 14, laborTotal: 89.99, partsTotal: 45.00 },
    { vehicleIdx: 2, status: WorkOrderStatus.COMPLETED, description: "Front brake pad replacement", daysAgo: 10, laborTotal: 187.50, partsTotal: 150.00 },
    { vehicleIdx: 10, status: WorkOrderStatus.COMPLETED, description: "DOT inspection and oil change", daysAgo: 7, laborTotal: 200.00, partsTotal: 85.00 },
    { vehicleIdx: 15, status: WorkOrderStatus.COMPLETED, description: "Transmission service", daysAgo: 5, laborTotal: 187.50, partsTotal: 120.00 },
    { vehicleIdx: 20, status: WorkOrderStatus.COMPLETED, description: "Annual safety inspection", daysAgo: 3, laborTotal: 125.00, partsTotal: 0 },
    // Invoiced (3)
    { vehicleIdx: 1, status: WorkOrderStatus.INVOICED, description: "AC recharge and inspection", daysAgo: 2, laborTotal: 125.00, partsTotal: 54.00 },
    { vehicleIdx: 11, status: WorkOrderStatus.INVOICED, description: "Brake service - full", daysAgo: 1, laborTotal: 375.00, partsTotal: 480.00 },
    { vehicleIdx: 16, status: WorkOrderStatus.INVOICED, description: "Engine diagnostic and repair", daysAgo: 1, laborTotal: 312.50, partsTotal: 220.00 },
    // In Progress (4)
    { vehicleIdx: 3, status: WorkOrderStatus.IN_PROGRESS, description: "Suspension inspection and repair", daysAgo: 0, laborTotal: 0, partsTotal: 0, bayNumber: "1", techIdx: 0 },
    { vehicleIdx: 12, status: WorkOrderStatus.IN_PROGRESS, description: "Coolant leak repair", daysAgo: 0, laborTotal: 0, partsTotal: 0, bayNumber: "2", techIdx: 1 },
    { vehicleIdx: 17, status: WorkOrderStatus.IN_PROGRESS, description: "Alternator replacement", daysAgo: 0, laborTotal: 0, partsTotal: 0, bayNumber: "3", techIdx: 2 },
    { vehicleIdx: 21, status: WorkOrderStatus.IN_PROGRESS, description: "Brake system overhaul", daysAgo: 0, laborTotal: 0, partsTotal: 0, bayNumber: "4", techIdx: 3 },
    // Waiting on Parts (2)
    { vehicleIdx: 4, status: WorkOrderStatus.WAITING_ON_PARTS, description: "Hybrid battery inspection", daysAgo: 1, laborTotal: 0, partsTotal: 0, techIdx: 3 },
    { vehicleIdx: 13, status: WorkOrderStatus.WAITING_ON_PARTS, description: "Turbo replacement", daysAgo: 2, laborTotal: 0, partsTotal: 0, techIdx: 0 },
    // Awaiting Approval (2)
    { vehicleIdx: 5, status: WorkOrderStatus.AWAITING_APPROVAL, description: "Timing belt replacement estimate", daysAgo: 1, laborTotal: 500.00, partsTotal: 350.00 },
    { vehicleIdx: 18, status: WorkOrderStatus.AWAITING_APPROVAL, description: "Transmission rebuild estimate", daysAgo: 0, laborTotal: 1200.00, partsTotal: 800.00 },
    // Estimate (2)
    { vehicleIdx: 6, status: WorkOrderStatus.ESTIMATE, description: "Full service estimate", daysAgo: 0, laborTotal: 450.00, partsTotal: 320.00 },
    { vehicleIdx: 22, status: WorkOrderStatus.ESTIMATE, description: "Engine rebuild estimate", daysAgo: 0, laborTotal: 2500.00, partsTotal: 1800.00 },
    // Ready for Pickup (1)
    { vehicleIdx: 7, status: WorkOrderStatus.READY_FOR_PICKUP, description: "Oil change complete", daysAgo: 0, laborTotal: 62.50, partsTotal: 38.00 },
    // Quality Check (1)
    { vehicleIdx: 14, status: WorkOrderStatus.QUALITY_CHECK, description: "Major service complete - QC needed", daysAgo: 0, laborTotal: 625.00, partsTotal: 420.00, techIdx: 4 },
  ]

  const workOrders: { id: string; vehicleId: string; customerId: string; status: WorkOrderStatus; total: number }[] = []
  for (const woData of workOrdersData) {
    const vehicle = vehicles[woData.vehicleIdx]
    const customer = customers.find(c => c.id === vehicle.customerId)!
    const createdAt = new Date(now.getTime() - woData.daysAgo * oneDay)
    const taxTotal = (woData.laborTotal + woData.partsTotal) * 0.0825
    const grandTotal = woData.laborTotal + woData.partsTotal + taxTotal

    const wo = await prisma.workOrder.create({
      data: {
        tenantId: tenant.id,
        workOrderNumber: `WO-2026-${String(woCounter++).padStart(4, '0')}`,
        customerId: customer.id,
        vehicleId: vehicle.id,
        fleetAccountId: vehicle.fleetAccountId,
        assignedTechnicianId: woData.techIdx !== undefined ? technicians[woData.techIdx].id : null,
        serviceAdvisorId: saProfile1.id,
        status: woData.status,
        priority: woData.status === WorkOrderStatus.WAITING_ON_PARTS ? WorkOrderPriority.HIGH : WorkOrderPriority.NORMAL,
        bayNumber: woData.bayNumber || null,
        odometerIn: vehicle.customerId ? Math.floor(Math.random() * 50000) + 20000 : null,
        description: woData.description,
        laborTotal: woData.laborTotal,
        partsTotal: woData.partsTotal,
        taxTotal: taxTotal,
        grandTotal: grandTotal,
        createdAt: createdAt,
        updatedAt: woData.status === WorkOrderStatus.COMPLETED ? new Date(createdAt.getTime() + 2 * oneDay) : now,
      },
    })
    workOrders.push({ id: wo.id, vehicleId: wo.vehicleId, customerId: wo.customerId, status: wo.status, total: grandTotal })
  }
  console.log("Created", workOrders.length, "work orders")

  // ==========================================
  // INVOICES (15 - for completed and invoiced work orders)
  // ==========================================
  const invoiceableWOs = workOrders.filter(wo =>
    wo.status === WorkOrderStatus.COMPLETED ||
    wo.status === WorkOrderStatus.INVOICED
  )

  let invCounter = 1
  const invoices: { id: string; workOrderId: string; total: number; status: InvoiceStatus }[] = []

  for (const wo of invoiceableWOs) {
    const customer = customers.find(c => c.id === wo.customerId)!
    const isPaid = wo.status === WorkOrderStatus.COMPLETED
    const daysAgo = isPaid ? Math.floor(Math.random() * 10) + 3 : Math.floor(Math.random() * 3)
    const createdAt = new Date(now.getTime() - daysAgo * oneDay)

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        invoiceNumber: `INV-2026-${String(invCounter++).padStart(4, '0')}`,
        workOrderId: wo.id,
        customerId: wo.customerId,
        fleetAccountId: customer.fleetAccountId,
        status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.SENT,
        subtotal: wo.total / 1.0825,
        taxRate: 0.0825,
        taxAmount: wo.total - (wo.total / 1.0825),
        total: wo.total,
        amountPaid: isPaid ? wo.total : 0,
        balanceDue: isPaid ? 0 : wo.total,
        dueDate: new Date(createdAt.getTime() + 30 * oneDay),
        paidAt: isPaid ? new Date(createdAt.getTime() + Math.floor(Math.random() * 7) * oneDay) : null,
        createdAt: createdAt,
      },
    })
    invoices.push({ id: invoice.id, workOrderId: wo.id, total: wo.total, status: invoice.status })
  }
  console.log("Created", invoices.length, "invoices")

  // ==========================================
  // APPOINTMENTS (for today and upcoming week)
  // ==========================================
  const appointmentsData = [
    { customerIdx: 0, vehicleIdx: 0, type: AppointmentType.APPOINTMENT, hoursFromNow: 2, duration: 60, status: AppointmentStatus.CONFIRMED, notes: "Oil change and tire rotation" },
    { customerIdx: 1, vehicleIdx: 2, type: AppointmentType.DROP_OFF, hoursFromNow: 3, duration: 120, status: AppointmentStatus.SCHEDULED, notes: "Check engine light on" },
    { customerIdx: 2, vehicleIdx: 3, type: AppointmentType.ESTIMATE_ONLY, hoursFromNow: 4, duration: 30, status: AppointmentStatus.CONFIRMED, notes: "Estimate for suspension work" },
    { customerIdx: 9, vehicleIdx: 10, type: AppointmentType.APPOINTMENT, hoursFromNow: 5, duration: 90, status: AppointmentStatus.SCHEDULED, notes: "DOT inspection - Unit ML-001" },
    { customerIdx: 10, vehicleIdx: 15, type: AppointmentType.APPOINTMENT, hoursFromNow: 6, duration: 60, status: AppointmentStatus.CONFIRMED, notes: "Brake inspection - Unit FT-001" },
    // Tomorrow
    { customerIdx: 3, vehicleIdx: 4, type: AppointmentType.APPOINTMENT, hoursFromNow: 26, duration: 120, status: AppointmentStatus.SCHEDULED, notes: "Hybrid battery diagnostic" },
    { customerIdx: 4, vehicleIdx: 5, type: AppointmentType.DROP_OFF, hoursFromNow: 27, duration: 180, status: AppointmentStatus.CONFIRMED, notes: "AC not cooling" },
    { customerIdx: 11, vehicleIdx: 20, type: AppointmentType.APPOINTMENT, hoursFromNow: 28, duration: 60, status: AppointmentStatus.SCHEDULED, notes: "Annual inspection - Unit CT-001" },
    // Day after
    { customerIdx: 5, vehicleIdx: 6, type: AppointmentType.APPOINTMENT, hoursFromNow: 50, duration: 90, status: AppointmentStatus.SCHEDULED, notes: "Transmission flush" },
    { customerIdx: 6, vehicleIdx: 7, type: AppointmentType.PICKUP, hoursFromNow: 51, duration: 15, status: AppointmentStatus.SCHEDULED, notes: "Pick up completed vehicle" },
  ]

  for (const apptData of appointmentsData) {
    const customer = customers[apptData.customerIdx]
    const vehicle = vehicles[apptData.vehicleIdx]
    const scheduledStart = new Date(now.getTime() + apptData.hoursFromNow * 60 * 60 * 1000)
    const scheduledEnd = new Date(scheduledStart.getTime() + apptData.duration * 60 * 1000)

    await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        customerId: customer.id,
        vehicleId: vehicle.id,
        technicianId: technicians[Math.floor(Math.random() * technicians.length)].id,
        type: apptData.type,
        scheduledStart,
        scheduledEnd,
        durationMinutes: apptData.duration,
        status: apptData.status,
        notes: apptData.notes,
      },
    })
  }
  console.log("Created", appointmentsData.length, "appointments")

  // ==========================================
  // PUNCH RECORDS (for today's technicians)
  // ==========================================
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0)

  for (let i = 0; i < 4; i++) {
    const tech = technicians[i]
    const clockInTime = new Date(todayStart.getTime() + Math.floor(Math.random() * 30) * 60 * 1000) // 7:00-7:30

    await prisma.punchRecord.create({
      data: {
        employeeId: tech.id,
        type: "CLOCK_IN",
        timestamp: clockInTime,
        punchMethod: PunchMethod.PIN,
      },
    })
  }
  console.log("Created punch records for today")

  // ==========================================
  // PERMISSION OVERRIDES (sample)
  // ==========================================
  // Give first technician (John Martinez) the ability to read invoices
  await prisma.permissionOverride.create({
    data: {
      userId: (await prisma.user.findFirst({ where: { email: "john@shopmule.com" } }))!.id,
      permission: "invoices:read",
      granted: true,
      grantedBy: admin.id,
      reason: "Senior tech needs to review invoice estimates",
    },
  })
  console.log("Created sample permission override")

  // ==========================================
  // DEDUCTIONS (for technicians)
  // ==========================================
  for (const tech of technicians) {
    await prisma.deduction.createMany({
      data: [
        {
          tenantId: tenant.id,
          employeeId: tech.id,
          type: DeductionType.TAX_FEDERAL,
          description: "Federal Income Tax",
          amount: 0,
          percentage: 12,
          isRecurring: true,
          isActive: true,
        },
        {
          tenantId: tenant.id,
          employeeId: tech.id,
          type: DeductionType.TAX_STATE,
          description: "IL State Income Tax",
          amount: 0,
          percentage: 4.95,
          isRecurring: true,
          isActive: true,
        },
        {
          tenantId: tenant.id,
          employeeId: tech.id,
          type: DeductionType.INSURANCE,
          description: "Health Insurance",
          amount: 250,
          isRecurring: true,
          isActive: true,
        },
      ],
    })
  }
  console.log("Created deductions for", technicians.length, "technicians")

  // ==========================================
  // LOAN ADVANCES (for 2 technicians)
  // ==========================================
  await prisma.loanAdvance.create({
    data: {
      tenantId: tenant.id,
      employeeId: technicians[0].id,
      description: "Tool purchase advance",
      originalAmount: 2000,
      remainingBalance: 1500,
      monthlyPayment: 250,
      issuedDate: new Date("2025-11-01"),
      isActive: true,
      notes: "Snap-On tool chest purchase",
    },
  })
  await prisma.loanAdvance.create({
    data: {
      tenantId: tenant.id,
      employeeId: technicians[2].id,
      description: "Emergency payroll advance",
      originalAmount: 1000,
      remainingBalance: 600,
      monthlyPayment: 200,
      issuedDate: new Date("2025-12-15"),
      isActive: true,
    },
  })
  console.log("Created 2 loan advances")

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n✅ Comprehensive seed completed!")
  console.log("\n📊 Summary:")
  console.log(`  - 1 Tenant: ${tenant.name}`)
  console.log(`  - ${9 + technicians.length} Users (1 owner, 2 service advisors, 1 service manager, 1 parts manager, ${technicians.length} technicians)`)
  console.log(`  - ${customers.length} Customers (${customers.filter(c => !c.fleetAccountId).length} retail, ${customers.filter(c => c.fleetAccountId).length} fleet)`)
  console.log(`  - ${fleetAccounts.length} Fleet Accounts`)
  console.log(`  - ${vehicles.length} Vehicles`)
  console.log(`  - ${parts.length} Parts`)
  console.log(`  - ${serviceTemplates.length} Service Templates`)
  console.log(`  - ${workOrders.length} Work Orders`)
  console.log(`  - ${invoices.length} Invoices`)
  console.log(`  - ${appointmentsData.length} Appointments`)
  console.log(`  - ${vendors.length} Vendors`)
  console.log(`  - ${certsData.length} Technician Certifications`)

  console.log(`  - ${technicians.length * 3} Deductions (3 per technician)`)
  console.log(`  - 2 Loan Advances`)
  console.log(`  - 1 Permission Override (sample)`)

  console.log("\n🔐 Login credentials:")
  console.log(`  Owner: ${adminEmail} / ${process.env.ADMIN_PASSWORD ? '[from env]' : 'admin123'}`)
  console.log("  Service Advisor: sarah@shopmule.com / advisor123")
  console.log("  Service Manager: lisa@shopmule.com / manager123")
  console.log("  Parts Manager: rick@shopmule.com / parts123")
  console.log("  Mechanic: john@shopmule.com / mechanic123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
