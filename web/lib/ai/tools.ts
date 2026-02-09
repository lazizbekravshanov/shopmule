import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/db'

// Tool definitions for the AI copilot
export const aiTools = {
  // Search customers
  searchCustomers: tool({
    description: 'Search for customers by name, email, or phone',
    parameters: z.object({
      query: z.string().describe('Search query - name, email, or phone number'),
    }),
    execute: async ({ query }: { query: string }) => {
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
    execute: async ({ query }: { query: string }) => {
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
        prisma.workOrder.count({ where: { status: 'PENDING' } }),
        prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.workOrder.count({
          where: {
            status: 'COMPLETED',
            updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        prisma.customer.count(),
        prisma.invoice.count({ where: { status: 'PENDING' } }),
      ])

      // Get low stock count separately with raw query
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
    execute: async ({ status, limit }: { status?: string; limit?: number }) => {
      const workOrders = await prisma.workOrder.findMany({
        where: status ? { status: status as 'PENDING' | 'DIAGNOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' } : undefined,
        include: {
          vehicle: { include: { Customer: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit || 10,
      })
      return workOrders.map(wo => ({
        id: wo.id,
        status: wo.status,
        description: wo.description,
        vehicleMake: wo.vehicle.make,
        vehicleModel: wo.vehicle.model,
        vehicleYear: wo.vehicle.year,
        customerName: wo.vehicle.Customer?.name || 'Unknown',
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
    execute: async ({ vehicleId, description }: { vehicleId: string; description: string }) => {
      const workOrder = await prisma.workOrder.create({
        data: {
          vehicleId,
          description,
          status: 'PENDING',
        },
        include: {
          vehicle: { include: { Customer: true } },
        },
      })
      return {
        id: workOrder.id,
        status: workOrder.status,
        description: workOrder.description,
        vehicle: `${workOrder.vehicle.year} ${workOrder.vehicle.make} ${workOrder.vehicle.model}`,
        customer: workOrder.vehicle.Customer?.name || 'Unknown',
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
    execute: async ({ workOrderId, status }: { workOrderId: string; status: string }) => {
      const workOrder = await prisma.workOrder.update({
        where: { id: workOrderId },
        data: { status: status as 'PENDING' | 'DIAGNOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' },
        include: { vehicle: true },
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
    execute: async ({ query, lowStockOnly }: { query?: string; lowStockOnly?: boolean }) => {
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
    execute: async ({ type }: { type?: string }) => {
      const [pendingWOs, lowStockParts, unpaidInvoices] = await Promise.all([
        prisma.workOrder.findMany({
          where: { status: { in: ['PENDING', 'DIAGNOSED'] } },
          include: { vehicle: { include: { Customer: true } } },
          orderBy: { createdAt: 'asc' },
          take: 5,
        }),
        prisma.part.findMany({
          where: { stock: { lte: 5 } },
          take: 5,
        }),
        prisma.invoice.findMany({
          where: { status: 'PENDING' },
          include: { workOrder: { include: { vehicle: { include: { Customer: true } } } } },
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
              customer: wo.vehicle.Customer?.name || 'Unknown',
              vehicle: `${wo.vehicle.make} ${wo.vehicle.model}`,
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
              customer: inv.workOrder?.vehicle?.Customer?.name || 'Unknown',
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
