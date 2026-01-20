import { prisma } from "@/lib/db"
import { RepairOrderStatus } from "@prisma/client"
import { z } from "zod"
import { getAuthSession, isValidUUID, sanitizeInput } from "@/lib/security"
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
  errorResponse,
} from "@/lib/api/response"

const createRepairOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  vehicleId: z.string().optional(),
  internalNotes: z.string().max(5000, "Notes too long").optional(),
  customerNotes: z.string().max(5000, "Notes too long").optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const data = createRepairOrderSchema.parse(body)

    // Validate UUIDs
    if (!isValidUUID(data.customerId)) {
      return errorResponse("Invalid customer ID format", 400, "INVALID_ID")
    }

    if (data.vehicleId && !isValidUUID(data.vehicleId)) {
      return errorResponse("Invalid vehicle ID format", 400, "INVALID_ID")
    }

    // Verify customer belongs to shop
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        shopId: session.user.shopId,
      },
    })

    if (!customer) {
      return errorResponse("Customer not found", 404, "NOT_FOUND")
    }

    // Verify vehicle if provided
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: data.vehicleId,
          shopId: session.user.shopId,
          customerId: data.customerId,
        },
      })

      if (!vehicle) {
        return errorResponse("Vehicle not found", 404, "NOT_FOUND")
      }
    }

    const repairOrder = await prisma.repairOrder.create({
      data: {
        shopId: session.user.shopId,
        customerId: data.customerId,
        vehicleId: data.vehicleId || null,
        internalNotes: data.internalNotes ? sanitizeInput(data.internalNotes) : null,
        customerNotes: data.customerNotes ? sanitizeInput(data.customerNotes) : null,
        status: RepairOrderStatus.DRAFT,
      },
      include: {
        customer: true,
        vehicle: true,
      },
    })

    return successResponse(repairOrder, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
