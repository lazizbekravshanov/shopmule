import { RepairOrderStatus, Role, InvoiceStatus } from "@prisma/client"

export const APP_NAME = "BodyShopper"
export const APP_DESCRIPTION = "Modern SaaS for trucking service centers"

// Pagination
export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 100

// Role display names
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  TECH: "Technician",
  VIEWER: "Viewer",
}

// Repair order status config
export const REPAIR_ORDER_STATUS_CONFIG: Record<RepairOrderStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  DRAFT: {
    label: "Draft",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  AWAITING_APPROVAL: {
    label: "Awaiting Approval",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  APPROVED: {
    label: "Approved",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  READY_TO_INVOICE: {
    label: "Ready to Invoice",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  INVOICED: {
    label: "Invoiced",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  CLOSED: {
    label: "Closed",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
}

// Invoice status config
export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  UNPAID: {
    label: "Unpaid",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  PAID: {
    label: "Paid",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
}

// Routes
export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  repairOrders: {
    list: "/repair-orders",
    new: "/repair-orders/new",
    detail: (id: string) => `/repair-orders/${id}`,
  },
  invoices: {
    list: "/invoices",
    detail: (id: string) => `/invoices/${id}`,
  },
  technicians: "/technicians",
  timeClock: "/time-clock",
  tv: "/tv",
} as const

// API endpoints
export const API_ROUTES = {
  customers: "/api/customers",
  vehicles: "/api/vehicles",
  repairOrders: "/api/repair-orders",
  timeEntries: {
    current: "/api/time-entries/current",
    today: "/api/time-entries/today",
    start: "/api/time-entries/start",
    stop: "/api/time-entries/stop",
  },
  attendance: {
    status: "/api/attendance/status",
    clockIn: "/api/attendance/clock-in",
    clockOut: "/api/attendance/clock-out",
  },
} as const

// Date formats
export const DATE_FORMATS = {
  display: "MMM d, yyyy",
  displayWithTime: "MMM d, yyyy h:mm a",
  input: "yyyy-MM-dd",
  time: "h:mm a",
  timeShort: "h:mm",
} as const
