import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { WorkOrderStatus, PaymentStatus, PunchType } from '@prisma/client'

// Tool definitions for the AI copilot
export const aiTools = {
  // Search customers
  searchCustomers: tool({
    description: 'Search for customers by name, email, phone, or company name. Use this whenever someone mentions a customer.',
    parameters: z.object({
      query: z.string().describe('Search query - name, email, phone, or company'),
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
        include: {
          Vehicle: {
            include: {
              WorkOrder: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        take: 5,
      })

      if (customers.length === 0) {
        return { found: false, message: `No customers found matching "${query}"` }
      }

      return {
        found: true,
        count: customers.length,
        customers: customers.map(c => ({
          id: c.id,
          name: c.name,
          contactName: c.contactName,
          email: c.email,
          phone: c.phone,
          vehicleCount: c.Vehicle.length,
          vehicles: c.Vehicle.map(v => ({
            id: v.id,
            description: `${v.year} ${v.make} ${v.model}`,
            licensePlate: v.licensePlate,
            hasActiveWorkOrder: v.WorkOrder.some(wo => wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED'),
            lastWorkOrder: v.WorkOrder[0] ? {
              id: v.WorkOrder[0].id,
              status: v.WorkOrder[0].status,
              description: v.WorkOrder[0].description,
            } : null,
          })),
        })),
      }
    },
  }),

  // Search vehicles
  searchVehicles: tool({
    description: 'Search for vehicles by VIN, make, model, year, or license plate. Use this when looking for a specific vehicle.',
    parameters: z.object({
      query: z.string().describe('Search query - VIN, make, model, year, or license plate'),
    }),
    execute: async ({ query }) => {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          OR: [
            { vin: { contains: query, mode: 'insensitive' } },
            { make: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { licensePlate: { contains: query, mode: 'insensitive' } },
            { year: isNaN(parseInt(query)) ? undefined : parseInt(query) },
          ],
        },
        include: {
          Customer: true,
          WorkOrder: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        take: 5,
      })

      if (vehicles.length === 0) {
        return { found: false, message: `No vehicles found matching "${query}"` }
      }

      return {
        found: true,
        count: vehicles.length,
        vehicles: vehicles.map(v => ({
          id: v.id,
          description: `${v.year} ${v.make} ${v.model}`,
          vin: v.vin,
          licensePlate: v.licensePlate,
          mileage: v.mileage,
          owner: v.Customer?.name || 'Unknown',
          customerId: v.customerId,
          recentWorkOrders: v.WorkOrder.map(wo => ({
            id: wo.id,
            status: wo.status,
            description: wo.description,
            date: wo.createdAt.toLocaleDateString(),
          })),
        })),
      }
    },
  }),

  // Get dashboard stats
  getDashboardStats: tool({
    description: 'Get current shop statistics - work orders, revenue, inventory alerts. Use this for general status questions.',
    parameters: z.object({}),
    execute: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [
        totalWorkOrders,
        pendingWorkOrders,
        diagnosedWorkOrders,
        inProgressWorkOrders,
        completedToday,
        totalCustomers,
        unpaidInvoices,
        overdueInvoices,
      ] = await Promise.all([
        prisma.workOrder.count(),
        prisma.workOrder.count({ where: { status: WorkOrderStatus.PENDING } }),
        prisma.workOrder.count({ where: { status: WorkOrderStatus.DIAGNOSED } }),
        prisma.workOrder.count({ where: { status: WorkOrderStatus.IN_PROGRESS } }),
        prisma.workOrder.count({
          where: {
            status: WorkOrderStatus.COMPLETED,
            updatedAt: { gte: today },
          },
        }),
        prisma.customer.count(),
        prisma.invoice.count({
          where: { status: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL] } }
        }),
        prisma.invoice.count({
          where: {
            status: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL] },
            createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        }),
      ])

      // Get low stock count
      let lowStockParts = 0
      try {
        const lowStockResult = await prisma.$queryRaw<[{count: bigint}]>`
          SELECT COUNT(*) as count FROM "Part" WHERE stock <= "reorderPoint"
        `
        lowStockParts = Number(lowStockResult[0]?.count || 0)
      } catch (e) {
        lowStockParts = await prisma.part.count({ where: { stock: { lte: 5 } } })
      }

      // Get unpaid total
      const unpaidTotal = await prisma.invoice.aggregate({
        where: { status: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL] } },
        _sum: { total: true }
      })

      return {
        workOrders: {
          total: totalWorkOrders,
          pending: pendingWorkOrders,
          awaitingApproval: diagnosedWorkOrders,
          inProgress: inProgressWorkOrders,
          completedToday,
        },
        alerts: {
          lowStockParts,
          unpaidInvoices,
          overdueInvoices,
          unpaidTotal: unpaidTotal._sum.total || 0,
        },
        totalCustomers,
        summary: `${inProgressWorkOrders} jobs in progress, ${pendingWorkOrders + diagnosedWorkOrders} waiting, ${lowStockParts > 0 ? `⚠️ ${lowStockParts} low stock items` : 'inventory OK'}`,
      }
    },
  }),

  // Get work orders
  getWorkOrders: tool({
    description: 'Get work orders list. Can filter by status or search by customer/vehicle.',
    parameters: z.object({
      status: z.enum(['PENDING', 'DIAGNOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
        .describe('Filter by status'),
      customerName: z.string().optional().describe('Filter by customer name'),
      limit: z.number().optional().describe('Number of results (default 10)'),
    }),
    execute: async ({ status, customerName, limit }) => {
      const workOrders = await prisma.workOrder.findMany({
        where: {
          ...(status ? { status: status as WorkOrderStatus } : {}),
          ...(customerName ? {
            Vehicle: {
              Customer: { name: { contains: customerName, mode: 'insensitive' } }
            }
          } : {}),
        },
        include: {
          Vehicle: { include: { Customer: true } },
          WorkOrderAssignment: { include: { EmployeeProfile: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit || 10,
      })

      if (workOrders.length === 0) {
        return { found: false, message: 'No work orders found matching criteria' }
      }

      return {
        found: true,
        count: workOrders.length,
        workOrders: workOrders.map(wo => ({
          id: wo.id,
          status: wo.status,
          description: wo.description,
          vehicle: `${wo.Vehicle.year} ${wo.Vehicle.make} ${wo.Vehicle.model}`,
          licensePlate: wo.Vehicle.licensePlate,
          customer: wo.Vehicle.Customer?.name || 'Unknown',
          assignedTo: wo.WorkOrderAssignment[0]?.EmployeeProfile?.name || 'Unassigned',
          created: wo.createdAt.toLocaleDateString(),
          daysOld: Math.floor((Date.now() - wo.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        })),
      }
    },
  }),

  // Create work order
  createWorkOrder: tool({
    description: 'Create a new work order. Need vehicle ID and description of work.',
    parameters: z.object({
      vehicleId: z.string().describe('The vehicle ID (get this from searchVehicles first)'),
      description: z.string().describe('Description of the work to be done'),
    }),
    execute: async ({ vehicleId, description }) => {
      try {
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
          success: true,
          workOrderId: workOrder.id,
          message: `✅ Work order created!`,
          details: {
            id: workOrder.id,
            vehicle: `${workOrder.Vehicle.year} ${workOrder.Vehicle.make} ${workOrder.Vehicle.model}`,
            customer: workOrder.Vehicle.Customer?.name || 'Unknown',
            description: workOrder.description,
          }
        }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create work order. Make sure the vehicle ID is valid.',
        }
      }
    },
  }),

  // Update work order status
  updateWorkOrderStatus: tool({
    description: 'Update work order status. Use this to move jobs through the workflow.',
    parameters: z.object({
      workOrderId: z.string().describe('The work order ID'),
      status: z.enum(['PENDING', 'DIAGNOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
        .describe('New status'),
    }),
    execute: async ({ workOrderId, status }) => {
      try {
        const workOrder = await prisma.workOrder.update({
          where: { id: workOrderId },
          data: { status: status as WorkOrderStatus },
          include: { Vehicle: true },
        })
        return {
          success: true,
          message: `✅ Work order updated to ${status}`,
          workOrder: {
            id: workOrder.id,
            status: workOrder.status,
            vehicle: `${workOrder.Vehicle.year} ${workOrder.Vehicle.make} ${workOrder.Vehicle.model}`,
          }
        }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update work order. Check the ID is correct.',
        }
      }
    },
  }),

  // Check inventory
  checkInventory: tool({
    description: 'Check parts inventory. Can search by name/SKU or just show low stock items.',
    parameters: z.object({
      query: z.string().optional().describe('Search by part name or SKU'),
      lowStockOnly: z.boolean().optional().describe('Only show items that need reordering'),
    }),
    execute: async ({ query, lowStockOnly }) => {
      let parts;

      if (lowStockOnly) {
        parts = await prisma.$queryRaw<Array<{
          id: string; sku: string; name: string; category: string | null;
          stock: number; reorderPoint: number; price: number;
        }>>`
          SELECT id, sku, name, category, stock, "reorderPoint", price
          FROM "Part"
          WHERE stock <= "reorderPoint"
          ORDER BY (stock - "reorderPoint") ASC
          LIMIT 15
        `
      } else if (query) {
        parts = await prisma.part.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
      } else {
        parts = await prisma.part.findMany({
          orderBy: { name: 'asc' },
          take: 10,
        })
      }

      if (parts.length === 0) {
        return {
          found: false,
          message: lowStockOnly ? 'Good news! No parts are running low.' : `No parts found matching "${query}"`,
        }
      }

      return {
        found: true,
        count: parts.length,
        parts: parts.map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          stock: p.stock,
          reorderPoint: p.reorderPoint,
          needsReorder: p.stock <= p.reorderPoint,
          price: `$${Number(p.price).toFixed(2)}`,
        })),
      }
    },
  }),

  // Get today's schedule
  getTodaysSchedule: tool({
    description: 'Get today\'s work schedule - active jobs, what\'s coming up, who\'s working on what.',
    parameters: z.object({}),
    execute: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get active work orders
      const activeWorkOrders = await prisma.workOrder.findMany({
        where: {
          status: { in: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.DIAGNOSED, WorkOrderStatus.APPROVED] },
        },
        include: {
          Vehicle: { include: { Customer: true } },
          WorkOrderAssignment: { include: { EmployeeProfile: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      })

      // Get technicians and their status
      const technicians = await prisma.employeeProfile.findMany({
        where: { role: 'MECHANIC', status: 'active' },
        include: {
          PunchRecord: {
            where: { timestamp: { gte: today } },
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
          WorkOrderAssignment: {
            where: {
              WorkOrder: { status: WorkOrderStatus.IN_PROGRESS }
            },
            include: {
              WorkOrder: { include: { Vehicle: true } }
            },
          },
        },
      })

      const schedule = {
        activeJobs: activeWorkOrders.map(wo => ({
          id: wo.id,
          status: wo.status,
          vehicle: `${wo.Vehicle.year} ${wo.Vehicle.make} ${wo.Vehicle.model}`,
          customer: wo.Vehicle.Customer?.name || 'Unknown',
          description: wo.description,
          assignedTo: wo.WorkOrderAssignment[0]?.EmployeeProfile?.name || 'Unassigned',
        })),
        technicians: technicians.map(tech => {
          const lastPunch = tech.PunchRecord[0]
          const currentJob = tech.WorkOrderAssignment[0]?.WorkOrder
          return {
            name: tech.name,
            status: lastPunch?.type === PunchType.CLOCK_IN ? 'Working' :
                    lastPunch?.type === PunchType.BREAK_START ? 'On Break' : 'Not Clocked In',
            currentJob: currentJob ? `${currentJob.Vehicle.make} ${currentJob.Vehicle.model}` : null,
          }
        }),
        summary: `${activeWorkOrders.filter(w => w.status === 'IN_PROGRESS').length} jobs in progress, ${technicians.filter(t => t.PunchRecord[0]?.type === PunchType.CLOCK_IN).length} techs working`,
      }

      return schedule
    },
  }),

  // Get recommendations
  getRecommendations: tool({
    description: 'Get smart recommendations - what needs attention, what to prioritize.',
    parameters: z.object({
      focus: z.enum(['all', 'urgent', 'revenue', 'inventory']).optional()
        .describe('What to focus on'),
    }),
    execute: async ({ focus }) => {
      const recommendations: Array<{
        priority: 'high' | 'medium' | 'low';
        type: string;
        title: string;
        message: string;
        action?: string;
        data?: unknown;
      }> = []

      // Check for stale work orders (pending > 48 hours)
      const staleWOs = await prisma.workOrder.findMany({
        where: {
          status: { in: [WorkOrderStatus.PENDING, WorkOrderStatus.DIAGNOSED] },
          createdAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
        },
        include: { Vehicle: { include: { Customer: true } } },
        take: 5,
      })

      if (staleWOs.length > 0 && (focus === 'all' || focus === 'urgent' || !focus)) {
        recommendations.push({
          priority: 'high',
          type: 'follow-up',
          title: `${staleWOs.length} estimates waiting 48+ hours`,
          message: 'These customers might be shopping around. Follow up today.',
          action: 'Call customers for approval',
          data: staleWOs.map(wo => ({
            customer: wo.Vehicle.Customer?.name,
            vehicle: `${wo.Vehicle.make} ${wo.Vehicle.model}`,
            daysWaiting: Math.floor((Date.now() - wo.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          })),
        })
      }

      // Check overdue invoices
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIAL] },
          createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        include: { Customer: true },
        take: 5,
      })

      if (overdueInvoices.length > 0 && (focus === 'all' || focus === 'revenue' || !focus)) {
        const total = overdueInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)
        recommendations.push({
          priority: 'high',
          type: 'collections',
          title: `$${total.toLocaleString()} in overdue invoices`,
          message: `${overdueInvoices.length} invoices over 30 days past due`,
          action: 'Send payment reminders',
          data: overdueInvoices.map(inv => ({
            customer: inv.Customer?.name,
            amount: `$${Number(inv.total).toFixed(2)}`,
          })),
        })
      }

      // Check low stock
      const lowStock = await prisma.$queryRaw<Array<{name: string; stock: number; reorderPoint: number}>>`
        SELECT name, stock, "reorderPoint" FROM "Part"
        WHERE stock <= "reorderPoint"
        ORDER BY (stock - "reorderPoint") ASC
        LIMIT 5
      `

      if (lowStock.length > 0 && (focus === 'all' || focus === 'inventory' || !focus)) {
        recommendations.push({
          priority: 'medium',
          type: 'inventory',
          title: `${lowStock.length} parts need reordering`,
          message: 'Running low on these items',
          action: 'Place orders with suppliers',
          data: lowStock.map(p => ({
            name: p.name,
            stock: p.stock,
            reorderPoint: p.reorderPoint,
          })),
        })
      }

      // Check work orders in progress too long
      const longRunningWOs = await prisma.workOrder.findMany({
        where: {
          status: WorkOrderStatus.IN_PROGRESS,
          updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        include: { Vehicle: true },
        take: 5,
      })

      if (longRunningWOs.length > 0 && (focus === 'all' || focus === 'urgent' || !focus)) {
        recommendations.push({
          priority: 'medium',
          type: 'operations',
          title: `${longRunningWOs.length} jobs running over a week`,
          message: 'These might be stuck or waiting on parts',
          action: 'Check status with technicians',
          data: longRunningWOs.map(wo => ({
            vehicle: `${wo.Vehicle.make} ${wo.Vehicle.model}`,
            description: wo.description,
            daysInProgress: Math.floor((Date.now() - wo.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
          })),
        })
      }

      if (recommendations.length === 0) {
        return {
          status: 'all-clear',
          message: '✅ Looking good! No urgent items need attention right now.',
        }
      }

      return {
        status: 'action-needed',
        count: recommendations.length,
        recommendations: recommendations.sort((a, b) =>
          a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
        ),
      }
    },
  }),

  // Quick search - searches everything
  quickSearch: tool({
    description: 'Search across customers, vehicles, and work orders at once. Use for general "find" requests.',
    parameters: z.object({
      query: z.string().describe('What to search for'),
    }),
    execute: async ({ query }) => {
      const [customers, vehicles, workOrders] = await Promise.all([
        prisma.customer.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 3,
        }),
        prisma.vehicle.findMany({
          where: {
            OR: [
              { make: { contains: query, mode: 'insensitive' } },
              { model: { contains: query, mode: 'insensitive' } },
              { licensePlate: { contains: query, mode: 'insensitive' } },
              { vin: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: { Customer: true },
          take: 3,
        }),
        prisma.workOrder.findMany({
          where: {
            OR: [
              { description: { contains: query, mode: 'insensitive' } },
              { Vehicle: { make: { contains: query, mode: 'insensitive' } } },
              { Vehicle: { model: { contains: query, mode: 'insensitive' } } },
              { Vehicle: { Customer: { name: { contains: query, mode: 'insensitive' } } } },
            ],
          },
          include: { Vehicle: { include: { Customer: true } } },
          take: 3,
        }),
      ])

      const results = {
        customers: customers.map(c => ({ id: c.id, name: c.name, phone: c.phone })),
        vehicles: vehicles.map(v => ({
          id: v.id,
          description: `${v.year} ${v.make} ${v.model}`,
          owner: v.Customer?.name,
          plate: v.licensePlate,
        })),
        workOrders: workOrders.map(wo => ({
          id: wo.id,
          status: wo.status,
          vehicle: `${wo.Vehicle.make} ${wo.Vehicle.model}`,
          customer: wo.Vehicle.Customer?.name,
        })),
      }

      const totalFound = customers.length + vehicles.length + workOrders.length

      if (totalFound === 0) {
        return { found: false, message: `Nothing found for "${query}"` }
      }

      return {
        found: true,
        totalResults: totalFound,
        results,
      }
    },
  }),
}
