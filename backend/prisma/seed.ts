import { PrismaClient, Role, WorkOrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.workOrderLabor.deleteMany();
  await prisma.workOrderPart.deleteMany();
  await prisma.workOrderAssignment.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.part.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user (if not exists)
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bodyshopper.com',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  // Create employees with users
  const employees = [];
  const employeeData = [
    { name: 'Mike Johnson', email: 'mike@bodyshopper.com', role: Role.MECHANIC, payRate: 35 },
    { name: 'Sarah Williams', email: 'sarah@bodyshopper.com', role: Role.MECHANIC, payRate: 38 },
    { name: 'Carlos Garcia', email: 'carlos@bodyshopper.com', role: Role.MECHANIC, payRate: 32 },
    { name: 'James Chen', email: 'james@bodyshopper.com', role: Role.MANAGER, payRate: 45 },
    { name: 'Emily Davis', email: 'emily@bodyshopper.com', role: Role.FRONT_DESK, payRate: 22 },
  ];

  for (const emp of employeeData) {
    const hash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: emp.email,
        passwordHash: hash,
        role: emp.role,
        employee: {
          create: {
            name: emp.name,
            role: emp.role,
            payRate: emp.payRate,
            status: 'active',
          },
        },
      },
      include: { employee: true },
    });
    employees.push(user.employee!);
  }

  console.log(`✅ Created ${employees.length} employees`);

  // Create vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: { name: 'AutoZone Pro', contact: 'John Smith', phone: '555-0101', email: 'pro@autozone.com' },
    }),
    prisma.vendor.create({
      data: { name: 'NAPA Commercial', contact: 'Lisa Brown', phone: '555-0102', email: 'commercial@napa.com' },
    }),
    prisma.vendor.create({
      data: { name: 'FleetPride', contact: 'Robert Wilson', phone: '555-0103', email: 'orders@fleetpride.com' },
    }),
  ]);

  console.log(`✅ Created ${vendors.length} vendors`);

  // Create parts/inventory
  const partsData = [
    { sku: 'OIL-5W30-5Q', name: '5W-30 Motor Oil (5 Quart)', category: 'Fluids', cost: 22.50, price: 34.99, stock: 48, reorderPoint: 12 },
    { sku: 'FILT-OIL-001', name: 'Oil Filter - Standard', category: 'Filters', cost: 6.50, price: 12.99, stock: 35, reorderPoint: 10 },
    { sku: 'FILT-AIR-001', name: 'Air Filter - Truck', category: 'Filters', cost: 18.00, price: 34.99, stock: 22, reorderPoint: 8 },
    { sku: 'BRAKE-PAD-HD', name: 'Heavy Duty Brake Pads (Set)', category: 'Brakes', cost: 85.00, price: 149.99, stock: 12, reorderPoint: 4 },
    { sku: 'BRAKE-ROTOR-HD', name: 'HD Brake Rotor', category: 'Brakes', cost: 120.00, price: 199.99, stock: 8, reorderPoint: 4 },
    { sku: 'BELT-SERP-001', name: 'Serpentine Belt', category: 'Belts', cost: 35.00, price: 59.99, stock: 15, reorderPoint: 5 },
    { sku: 'BATT-HD-001', name: 'Heavy Duty Battery', category: 'Electrical', cost: 145.00, price: 229.99, stock: 6, reorderPoint: 3 },
    { sku: 'SPARK-PLUG-8', name: 'Spark Plugs (Set of 8)', category: 'Ignition', cost: 48.00, price: 79.99, stock: 18, reorderPoint: 6 },
    { sku: 'FUEL-FILT-001', name: 'Fuel Filter', category: 'Filters', cost: 28.00, price: 49.99, stock: 14, reorderPoint: 5 },
    { sku: 'TRANS-FLUID-1G', name: 'Transmission Fluid (1 Gallon)', category: 'Fluids', cost: 18.00, price: 32.99, stock: 24, reorderPoint: 8 },
    { sku: 'COOLANT-1G', name: 'Engine Coolant (1 Gallon)', category: 'Fluids', cost: 12.00, price: 24.99, stock: 30, reorderPoint: 10 },
    { sku: 'WIPER-HD-26', name: 'HD Wiper Blade 26"', category: 'Accessories', cost: 15.00, price: 28.99, stock: 3, reorderPoint: 6 },
  ];

  const parts = await Promise.all(
    partsData.map((part, i) =>
      prisma.part.create({
        data: { ...part, vendorId: vendors[i % vendors.length].id },
      })
    )
  );

  console.log(`✅ Created ${parts.length} parts`);

  // Create customers
  const customersData = [
    { name: 'FleetMax Logistics', contactName: 'Tom Anderson', phone: '555-1001', email: 'tom@fleetmax.com', billingAddress: '123 Industrial Blvd, Austin, TX 78701' },
    { name: 'ABC Trucking Co', contactName: 'Mary Johnson', phone: '555-1002', email: 'mary@abctrucking.com', billingAddress: '456 Highway 35, Austin, TX 78702' },
    { name: 'Quick Delivery Services', contactName: 'David Lee', phone: '555-1003', email: 'david@quickdelivery.com', billingAddress: '789 Commerce St, Austin, TX 78703' },
    { name: 'Regional Transport LLC', contactName: 'Susan Miller', phone: '555-1004', email: 'susan@regionaltransport.com', billingAddress: '321 Freight Way, Austin, TX 78704' },
    { name: 'Metro Moving Inc', contactName: 'Chris Taylor', phone: '555-1005', email: 'chris@metromoving.com', billingAddress: '654 Logistics Park, Austin, TX 78705' },
    { name: 'Express Haul LLC', contactName: 'Jennifer White', phone: '555-1006', email: 'jen@expresshaul.com', billingAddress: '987 Truck Lane, Austin, TX 78706' },
  ];

  const customers = await Promise.all(
    customersData.map((c) => prisma.customer.create({ data: c }))
  );

  console.log(`✅ Created ${customers.length} customers`);

  // Create vehicles
  const vehiclesData = [
    { vin: '1HGBH41JXMN109186', unitNumber: 'FLT-001', make: 'Freightliner', model: 'Cascadia', year: 2021, mileage: 125000 },
    { vin: '2FMDK3GC8ABA12345', unitNumber: 'FLT-002', make: 'Peterbilt', model: '579', year: 2020, mileage: 180000 },
    { vin: '3AKJHHDR5DSGA1234', unitNumber: 'ABC-101', make: 'Kenworth', model: 'T680', year: 2022, mileage: 85000 },
    { vin: '4V4NC9EH5EN123456', unitNumber: 'ABC-102', make: 'Volvo', model: 'VNL 760', year: 2021, mileage: 142000 },
    { vin: '5NPEC4AC7BH123456', unitNumber: 'QDS-001', make: 'International', model: 'LT', year: 2019, mileage: 220000 },
    { vin: '1FUJGLDR9CLBP1234', unitNumber: 'REG-050', make: 'Freightliner', model: 'M2 106', year: 2020, mileage: 95000 },
    { vin: '2NKHHM6X58M123456', unitNumber: 'MET-010', make: 'Hino', model: '338', year: 2021, mileage: 68000 },
    { vin: '3HSDJAPR5CN123456', unitNumber: 'EXP-201', make: 'Mack', model: 'Anthem', year: 2022, mileage: 45000 },
  ];

  const vehicles = await Promise.all(
    vehiclesData.map((v, i) =>
      prisma.vehicle.create({
        data: { ...v, customerId: customers[i % customers.length].id },
      })
    )
  );

  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create work orders with varying statuses
  const workOrdersData = [
    { vehicleIdx: 0, status: WorkOrderStatus.COMPLETED, description: 'Full service - oil change, brake inspection, tire rotation', laborHours: 3.5, partsTotal: 189.97 },
    { vehicleIdx: 1, status: WorkOrderStatus.COMPLETED, description: 'Engine diagnostic and repair - replaced fuel injectors', laborHours: 6.0, partsTotal: 850.00 },
    { vehicleIdx: 2, status: WorkOrderStatus.IN_PROGRESS, description: 'Transmission service and fluid flush', laborHours: 2.5, partsTotal: 165.95 },
    { vehicleIdx: 3, status: WorkOrderStatus.IN_PROGRESS, description: 'AC system repair - compressor replacement', laborHours: 4.0, partsTotal: 520.00 },
    { vehicleIdx: 4, status: WorkOrderStatus.APPROVED, description: 'Brake system overhaul - pads and rotors', laborHours: 0, partsTotal: 0 },
    { vehicleIdx: 5, status: WorkOrderStatus.DIAGNOSED, description: 'Check engine light diagnostic', laborHours: 0, partsTotal: 0 },
    { vehicleIdx: 6, status: WorkOrderStatus.COMPLETED, description: 'DOT inspection and safety check', laborHours: 2.0, partsTotal: 45.99 },
    { vehicleIdx: 7, status: WorkOrderStatus.COMPLETED, description: 'Preventive maintenance - 50K service', laborHours: 4.5, partsTotal: 324.95 },
    { vehicleIdx: 0, status: WorkOrderStatus.COMPLETED, description: 'Electrical system repair - alternator replacement', laborHours: 2.5, partsTotal: 289.99 },
    { vehicleIdx: 2, status: WorkOrderStatus.DIAGNOSED, description: 'Suspension noise investigation', laborHours: 0, partsTotal: 0 },
  ];

  const workOrders = [];
  for (const wo of workOrdersData) {
    const workOrder = await prisma.workOrder.create({
      data: {
        vehicleId: vehicles[wo.vehicleIdx].id,
        status: wo.status,
        description: wo.description,
        laborHours: wo.laborHours,
        partsTotal: wo.partsTotal,
        laborRate: 125,
      },
    });
    workOrders.push(workOrder);

    // Assign a technician
    if (wo.status !== WorkOrderStatus.DIAGNOSED) {
      await prisma.workOrderAssignment.create({
        data: {
          workOrderId: workOrder.id,
          employeeId: employees[Math.floor(Math.random() * 3)].id, // Random mechanic
        },
      });
    }
  }

  console.log(`✅ Created ${workOrders.length} work orders`);

  // Create invoices for completed work orders
  const completedOrders = workOrders.filter((_, i) => workOrdersData[i].status === WorkOrderStatus.COMPLETED);
  const invoices = [];

  for (const wo of completedOrders) {
    const vehicle = vehicles.find(v => v.id === wo.vehicleId)!;
    const customer = customers.find(c => c.id === vehicle.customerId)!;

    const subtotalLabor = wo.laborHours * wo.laborRate;
    const subtotalParts = wo.partsTotal;
    const tax = (subtotalLabor + subtotalParts) * 0.0825; // 8.25% tax
    const total = subtotalLabor + subtotalParts + tax;

    const invoice = await prisma.invoice.create({
      data: {
        workOrderId: wo.id,
        customerId: customer.id,
        subtotalParts,
        subtotalLabor,
        tax,
        total,
        status: Math.random() > 0.3 ? PaymentStatus.PAID : PaymentStatus.UNPAID,
      },
    });
    invoices.push(invoice);

    // Add payment for paid invoices
    if (invoice.status === PaymentStatus.PAID) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          method: ['Credit Card', 'Check', 'Cash', 'ACH'][Math.floor(Math.random() * 4)],
          amount: total,
          receivedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
        },
      });
    }
  }

  console.log(`✅ Created ${invoices.length} invoices`);

  // Create time entries for today and recent days
  const now = new Date();
  const timeEntries = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    for (const emp of employees.slice(0, 3)) { // Mechanics only
      const clockIn = new Date(now);
      clockIn.setDate(clockIn.getDate() - dayOffset);
      clockIn.setHours(7, 30 + Math.floor(Math.random() * 30), 0, 0);

      const clockOut = new Date(clockIn);
      clockOut.setHours(16, 30 + Math.floor(Math.random() * 60), 0, 0);

      // Skip future days
      if (clockIn > now) continue;

      const entry = await prisma.timeEntry.create({
        data: {
          employeeId: emp.id,
          clockIn,
          clockOut: dayOffset === 0 && now.getHours() < 17 ? null : clockOut, // Today might still be clocked in
        },
      });
      timeEntries.push(entry);
    }
  }

  console.log(`✅ Created ${timeEntries.length} time entries`);

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - ${employees.length + 1} users (including admin)`);
  console.log(`   - ${employees.length} employees`);
  console.log(`   - ${customers.length} customers`);
  console.log(`   - ${vehicles.length} vehicles`);
  console.log(`   - ${parts.length} inventory items`);
  console.log(`   - ${workOrders.length} work orders`);
  console.log(`   - ${invoices.length} invoices`);
  console.log(`   - ${timeEntries.length} time entries`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
