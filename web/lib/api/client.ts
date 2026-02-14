import type {
  Customer,
  Vehicle,
  WorkOrder,
  Part,
  TimeEntry,
  PunchRecord,
} from "@prisma/client"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.error || errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData.code
    )
  }
  return response.json()
}

const defaultHeaders = {
  "Content-Type": "application/json",
}

export const api = {
  // Customers
  customers: {
    list: async (): Promise<Customer[]> => {
      const response = await fetch("/api/customers")
      return handleResponse<Customer[]>(response)
    },
  },

  // Vehicles
  vehicles: {
    list: async (customerId?: string): Promise<Vehicle[]> => {
      const url = customerId
        ? `/api/vehicles?customerId=${customerId}`
        : "/api/vehicles"
      const response = await fetch(url)
      return handleResponse<Vehicle[]>(response)
    },
  },

  // Work Orders (formerly Repair Orders)
  workOrders: {
    list: async (): Promise<WorkOrder[]> => {
      const response = await fetch("/api/work-orders")
      return handleResponse<WorkOrder[]>(response)
    },
    create: async (data: CreateWorkOrderInput): Promise<WorkOrder> => {
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(data),
      })
      return handleResponse<WorkOrder>(response)
    },
  },

  // Time Entries
  timeEntries: {
    today: async (): Promise<TimeEntry[]> => {
      const response = await fetch("/api/time-entries/today")
      const data = await handleResponse<{ entries: TimeEntry[] }>(response)
      return data.entries
    },
    start: async (workOrderId?: string, notes?: string): Promise<TimeEntry> => {
      const response = await fetch("/api/time-entries/start", {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({ workOrderId, notes }),
      })
      const data = await handleResponse<{ timeEntry: TimeEntry }>(response)
      return data.timeEntry
    },
    stop: async (notes?: string): Promise<TimeEntry> => {
      const response = await fetch("/api/time-entries/stop", {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({ notes }),
      })
      const data = await handleResponse<{ timeEntry: TimeEntry }>(response)
      return data.timeEntry
    },
  },

  // TV Dashboard
  tv: {
    dashboard: async (): Promise<TvDashboardData> => {
      const response = await fetch("/api/tv/dashboard")
      return handleResponse<TvDashboardData>(response)
    },
  },
}

// Input types
export interface CreateWorkOrderInput {
  vehicleId: string
  description: string
  notes?: string
  checklist?: string
}

export interface TvDashboardData {
  activeOrders: Array<{
    id: string
    status: string
    customer: { name: string }
    vehicle: { make: string; model: string; year: number }
  }>
  technicianStatus: Array<{
    id: string
    name: string
    isClockedIn: boolean
    currentOrder: string | null
  }>
}
