import { z } from "zod"

export const startTimeEntrySchema = z.object({
  repairOrderId: z.string().uuid("Invalid repair order ID"),
  notes: z.string().max(1000, "Notes too long").optional(),
})

export const stopTimeEntrySchema = z.object({
  notes: z.string().max(1000, "Notes too long").optional(),
})

export type StartTimeEntryInput = z.infer<typeof startTimeEntrySchema>
export type StopTimeEntryInput = z.infer<typeof stopTimeEntrySchema>
