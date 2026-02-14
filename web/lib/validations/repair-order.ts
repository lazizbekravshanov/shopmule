import { z } from "zod"
import { WorkOrderStatus } from "@prisma/client"

export const createRepairOrderSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  internalNotes: z.string().max(5000, "Notes too long").optional(),
  customerNotes: z.string().max(5000, "Notes too long").optional(),
})

export const updateRepairOrderSchema = z.object({
  status: z.nativeEnum(WorkOrderStatus).optional(),
  internalNotes: z.string().max(5000).optional(),
  customerNotes: z.string().max(5000).optional(),
  isComeback: z.boolean().optional(),
})

export type CreateRepairOrderInput = z.infer<typeof createRepairOrderSchema>
export type UpdateRepairOrderInput = z.infer<typeof updateRepairOrderSchema>
