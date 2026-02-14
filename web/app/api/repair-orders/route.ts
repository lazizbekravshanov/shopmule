import { prisma } from "@/lib/db"
import { WorkOrderStatus } from "@prisma/client"
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

    // Verify customer exists
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
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
          customerId: data.customerId,
        },
      })

      if (!vehicle) {
        return errorResponse("Vehicle not found", 404, "NOT_FOUND")
      }
    }

    // Use workOrder model (repairOrder doesn't exist in schema)
    const workOrder = await prisma.workOrder.create({
      data: {
        tenantId: customer.tenantId,
        customerId: data.customerId,
        vehicleId: data.vehicleId || "",
        workOrderNumber: `WO-${Date.now()}`,
        description: data.customerNotes ? sanitizeInput(data.customerNotes) : "New repair order",
        internalNotes: data.internalNotes ? sanitizeInput(data.internalNotes) : null,
        customerVisibleNotes: data.customerNotes ? sanitizeInput(data.customerNotes) : null,
        status: WorkOrderStatus.DRAFT,
      },
      include: {
        Customer: true,
        Vehicle: true,
      },
    })

    return successResponse(workOrder, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
