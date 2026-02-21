import { WorkOrderStatus, Role, InvoiceStatus } from "@prisma/client"

export const APP_NAME = "ShopMule"
export const APP_DESCRIPTION = "Modern SaaS for trucking service centers"

// Pagination
export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 100

// Role display names
export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  SERVICE_MANAGER: "Service Manager",
  SERVICE_ADVISOR: "Service Advisor",
  PARTS_MANAGER: "Parts Manager",
  OFFICE_MANAGER: "Office Manager",
  SENIOR_TECHNICIAN: "Senior Technician",
  MECHANIC: "Mechanic",
  TECHNICIAN: "Technician",
  FRONT_DESK: "Front Desk",
  TIMESHEET_USER: "Timesheet User",
  CUSTOMER: "Customer",
}

// Work order status config
export const WORK_ORDER_STATUS_CONFIG: Record<WorkOrderStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  DRAFT: {
    label: "Draft",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  ESTIMATE: {
    label: "Estimate",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
  },
  ESTIMATE_SENT: {
    label: "Estimate Sent",
    color: "text-sky-700",
    bgColor: "bg-sky-100",
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
  WAITING_ON_PARTS: {
    label: "Waiting on Parts",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  QUALITY_CHECK: {
    label: "Quality Check",
    color: "text-teal-700",
    bgColor: "bg-teal-100",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  INVOICED: {
    label: "Invoiced",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  ARCHIVED: {
    label: "Archived",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
  DIAGNOSED: {
    label: "Diagnosed",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
  },
}

// Invoice status config
export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  DRAFT: {
    label: "Draft",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  SENT: {
    label: "Sent",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  VIEWED: {
    label: "Viewed",
    color: "text-sky-700",
    bgColor: "bg-sky-100",
  },
  PARTIAL: {
    label: "Partially Paid",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  PAID: {
    label: "Paid",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  OVERDUE: {
    label: "Overdue",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  VOID: {
    label: "Void",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  COLLECTIONS: {
    label: "Collections",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  UNPAID: {
    label: "Unpaid",
    color: "text-red-700",
    bgColor: "bg-red-100",
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
