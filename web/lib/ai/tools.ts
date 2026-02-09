import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { WorkOrderStatus, PaymentStatus } from '@prisma/client'

// Tool definitions for the AI copilot
export const aiTools = {
  // Search customers
  searchCustomers: tool({
    description: 'Search for customers by name, email, or phone',
    parameters: z.object({
      query: z.string().describe('Search query - name, email, or phone number'),
    }),
    execute: async ({ query }) => {
      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { contactName: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { Vehicle: true },
        take: 5,
      })
      return customers.map(c => ({
        id: c.id,
        name: c.name,
        contactName: c.contactName,
        email: c.email,
        phone: c.phone,
        vehicleCount: c.Vehicle.length,
        vehicles: c.Vehicle.map(v => ({ id: v.id, make: v.make, model: v.model, year: v.year })),
      }))
    },
  }),

  // Search vehicles
  searchVehicles: tool({
    description: 'Search for vehicles by VIN, make, model, or license plate',
    parameters: z.object({
      query: z.string().describe('Search query - VIN, make, model, or license plate'),
    }),
    execute: async ({ query }) => {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          OR: [
            { vin: { contains: query, mode: 'insensitive' } },
            { make: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { licensePlate: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { Customer: true },
        take: 5,
      })
      return vehicles.map(v => ({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        mileage: v.mileage,
        licensePlate: v.licensePlate,
        customerName: v.Customer?.name || 'Unknown',
        customerId: v.customerId,
      }))
    },
  }),

  // Get dashboard stats
  getDashboardStats: tool({
    description: 'Get current dashboard statistics including work orders, revenue, and inventory alerts',
    parameters: z.object({}),
    execute: async () => {
      const [
        totalWorkOrders,
        pendingWorkOrders,
        inProgressWorkOrders,
        completedToday,
        totalCustomers,
        unpaidInvoices,
      ] = await Promise.all([
        prisma.workOrder.count(),
        prisma.workOrder.count({ where: { status: WorkOrderStatus.PENDING } }),
        prisma.workOrder.count({ where: { status: WorkOrderStatus.IN_PROGRESS } }),
        prisma.workOrder.count({
          where: {
            status: WorkOrderStatus.COMPLETED,
            updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        prisma.customer.count(),
        prisma.invoice.count({ where: { status: PaymentStatus.PENDING } }),
      ])

      // Get low stock count
      const lowStockResult = await prisma.$queryRaw<[{count: bigint}]>`
        SELECT COUNT(*) as count FROM "Part" WHERE stock <= "reorderPoint"
      `
      const lowStockParts = Number(lowStockResult[0]?.count || 0)

      return {
        totalWorkOrders,
        pendingWorkOrders,
        inProgressWorkOrders,
        completedToday,
        lowStockParts,
        totalCustomers,
        unpaidInvoices,
      }
    },
  }),

  // Get work orders
  getWorkOrders: tool({
    description: 'Get work orders with optional status filter',
    parameters: z.object({
      status: z.enum(['PENDING', 'DIAGNOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
        .describe('Filter by status'),
      limit: z.number().optional().describe('Number of results to return'),
    }),
    execute: async ({ status, limit }) => {
      const workOrders = await prisma.workOrder.findMany({
        where: status ? { status: status as WorkOrderStatus } : undefined,
        include: {
          Vehicle: { include: { Customer: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit || 10,
      })
      return workOrders.map(wo => ({
        id: wo.id,
        status: wo.status,
        description: wo.description,
        vehicleMake: wo.Vehicle.make,
        vehicleModel: wo.Vehicle.model,
        vehicleYear: wo.Vehicle.year,
        customerName: wo.Vehicle.Customer?.name || 'Unknown',
        createdAt: wo.createdAt.toISOString(),
      }))
    },
  }),

  // Create work order
  createWorkOrder: tool({
    description: 'Create a new work order for a vehicle',
    parameters: z.object({
      vehicleId: z.string().describe('The vehicle ID'),
      description: z.string().describe('Description of the work to be done'),
    }),
    execute: async ({ vehicleId, description }) => {
      const workOrder = await prisma.workOrder.create({
        data: {
          vehicleId,
          description,
          status: WorkOrderStatus.PENDING,
        },
        include: {
          Vehicle: { include: { Customer: true } },
        },
      })
      return {
        id: workOrder.id,
        status: workOrder.status,
        description: workOrder.description,
        vehicle: `${workOrder.Vehicle.year} ${workOrder.Vehicle.make} ${workOrder.Vehicle.model}`,
        customer: workOrder.Vehicle.Customer?.name || 'Unknown',
        message: `Work order created successfully`,
      }
    },
  }),

  // Update work order status
  updateWorkOrderStatus: tool({
    description: 'Update the status of a work order',
    parameters: z.object({
      workOrderId: z.string().describe('The work order ID'),
      status: z.enum(['PENDING', 'DIAGNOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
        .describe('New status'),
    }),
    execute: async ({ workOrderId, status }) => {
      const workOrder = await prisma.workOrder.update({
        where: { id: workOrderId },
        data: { status: status as WorkOrderStatus },
        include: { Vehicle: true },
      })
      return {
        id: workOrder.id,
        status: workOrder.status,
        message: `Work order ${workOrder.id} status updated to ${status}`,
      }
    },
  }),

  // Check inventory
  checkInventory: tool({
    description: 'Check inventory levels, optionally search by part name or SKU',
    parameters: z.object({
      query: z.string().optional().describe('Search by part name or SKU'),
      lowStockOnly: z.boolean().optional().describe('Only show low stock items'),
    }),
    execute: async ({ query, lowStockOnly }) => {
      const parts = await prisma.part.findMany({
        where: query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ],
        } : undefined,
        take: 10,
      })

      const filteredParts = lowStockOnly
        ? parts.filter(p => p.stock <= p.reorderPoint)
        : parts

      return filteredParts.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        stock: p.stock,
        reorderPoint: p.reorderPoint,
        price: Number(p.price),
        isLowStock: p.stock <= p.reorderPoint,
      }))
    },
  }),

  // Get AI recommendations
  getRecommendations: tool({
    description: 'Get AI-powered recommendations for the shop based on current data',
    parameters: z.object({
      type: z.enum(['priorities', 'inventory', 'scheduling', 'general']).optional()
        .describe('Type of recommendations to get'),
    }),
    execute: async ({ type }) => {
      const [pendingWOs, lowStockParts, unpaidInvoices] = await Promise.all([
        prisma.workOrder.findMany({
          where: { status: { in: [WorkOrderStatus.PENDING, WorkOrderStatus.DIAGNOSED] } },
          include: { Vehicle: { include: { Customer: true } } },
          orderBy: { createdAt: 'asc' },
          take: 5,
        }),
        prisma.part.findMany({
          where: { stock: { lte: 5 } },
          take: 5,
        }),
        prisma.invoice.findMany({
          where: { status: PaymentStatus.PENDING },
          include: { workOrder: { include: { Vehicle: { include: { Customer: true } } } } },
          take: 5,
        }),
      ])

      const recommendations: Array<{
        type: string;
        title: string;
        message: string;
        action: string;
        items?: unknown[];
      }> = []

      if (type === 'priorities' || type === 'general' || !type) {
        if (pendingWOs.length > 0) {
          recommendations.push({
            type: 'priority',
            title: 'Pending Work Orders',
            message: `You have ${pendingWOs.length} work orders waiting to be started.`,
            action: 'Review and prioritize these work orders',
            items: pendingWOs.map(wo => ({
              id: wo.id,
              description: wo.description,
              customer: wo.Vehicle.Customer?.name || 'Unknown',
              vehicle: `${wo.Vehicle.make} ${wo.Vehicle.model}`,
              waitingDays: Math.floor((Date.now() - wo.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
            })),
          })
        }
      }

      if (type === 'inventory' || type === 'general' || !type) {
        if (lowStockParts.length > 0) {
          recommendations.push({
            type: 'inventory',
            title: 'Low Stock Alert',
            message: `${lowStockParts.length} parts are running low and need reordering`,
            action: 'Order these parts to avoid delays',
            items: lowStockParts.map(p => ({
              sku: p.sku,
              name: p.name,
              currentStock: p.stock,
              reorderPoint: p.reorderPoint,
            })),
          })
        }
      }

      if (type === 'general' || !type) {
        if (unpaidInvoices.length > 0) {
          const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)
          recommendations.push({
            type: 'revenue',
            title: 'Unpaid Invoices',
            message: `You have ${unpaidInvoices.length} unpaid invoices totaling $${totalUnpaid.toFixed(2)}`,
            action: 'Follow up with customers on payment',
            items: unpaidInvoices.map(inv => ({
              id: inv.id,
              customer: inv.workOrder?.Vehicle?.Customer?.name || 'Unknown',
              amount: Number(inv.total),
            })),
          })
        }
      }

      if (recommendations.length === 0) {
        recommendations.push({
          type: 'success',
          title: 'Looking Good!',
          message: 'No urgent items requiring attention. Shop operations are running smoothly.',
          action: 'Keep up the great work!',
        })
      }

      return recommendations
    },
  }),
}
