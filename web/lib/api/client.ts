import type {
  Customer,
  Vehicle,
  RepairOrder,
  User,
  Part,
  TimeEntry,
  ShiftPunch
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

  // Repair Orders
  repairOrders: {
    list: async (): Promise<RepairOrder[]> => {
      const response = await fetch("/api/repair-orders")
      return handleResponse<RepairOrder[]>(response)
    },
    create: async (data: CreateRepairOrderInput): Promise<RepairOrder> => {
      const response = await fetch("/api/repair-orders", {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(data),
      })
      return handleResponse<RepairOrder>(response)
    },
  },

  // Time Entries
  timeEntries: {
    current: async (): Promise<TimeEntry | null> => {
      const response = await fetch("/api/time-entries/current")
      const data = await handleResponse<{ timeEntry: TimeEntry | null }>(response)
      return data.timeEntry
    },
    today: async (): Promise<TimeEntry[]> => {
      const response = await fetch("/api/time-entries/today")
      const data = await handleResponse<{ entries: TimeEntry[] }>(response)
      return data.entries
    },
    start: async (repairOrderId: string, notes?: string): Promise<TimeEntry> => {
      const response = await fetch("/api/time-entries/start", {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({ repairOrderId, notes }),
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

  // Attendance
  attendance: {
    status: async (): Promise<AttendanceStatus> => {
      const response = await fetch("/api/attendance/status")
      return handleResponse<AttendanceStatus>(response)
    },
    clockIn: async (): Promise<ShiftPunch> => {
      const response = await fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: defaultHeaders,
      })
      const data = await handleResponse<{ punch: ShiftPunch }>(response)
      return data.punch
    },
    clockOut: async (): Promise<ShiftPunch> => {
      const response = await fetch("/api/attendance/clock-out", {
        method: "POST",
        headers: defaultHeaders,
      })
      const data = await handleResponse<{ punch: ShiftPunch }>(response)
      return data.punch
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
export interface CreateRepairOrderInput {
  customerId: string
  vehicleId: string
  internalNotes?: string
  customerNotes?: string
}

export interface AttendanceStatus {
  isClockedIn: boolean
  currentPunch: ShiftPunch | null
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
