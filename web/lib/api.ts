const API_BASE = '/api';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
  }
}

export function getAuthRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authRole');
}

export function setAuthRole(role: string | null) {
  if (typeof window === 'undefined') return;
  if (role) {
    localStorage.setItem('authRole', role);
  } else {
    localStorage.removeItem('authRole');
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = 'Request failed';
    try {
      const json = JSON.parse(text);
      message = json.message || message;
    } catch {
      message = text || message;
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}

// Types
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  payRate: number;
  status: string;
  userId: string;
  user?: User;
}

export interface Customer {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  billingAddress?: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  vin: string;
  unitNumber?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  licensePlate?: string;
  customerId: string;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  status: 'DIAGNOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  description: string;
  checklist?: string;
  notes?: string;
  laborHours: number;
  partsTotal: number;
  laborRate: number;
  vehicle?: Vehicle & { customer?: Customer };
  assignments?: { employee: Employee }[];
  partsUsed?: WorkOrderPart[];
  laborEntries?: WorkOrderLabor[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrderPart {
  id: string;
  quantity: number;
  unitPrice: number;
  markupPct: number;
  part?: Part;
}

export interface WorkOrderLabor {
  id: string;
  hours: number;
  rate: number;
  note?: string;
  employee?: Employee;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  category?: string;
  cost: number;
  price: number;
  stock: number;
  reorderPoint: number;
  vendorId?: string;
  vendor?: Vendor;
}

export interface Vendor {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface Invoice {
  id: string;
  workOrderId: string;
  customerId: string;
  subtotalParts: number;
  subtotalLabor: number;
  tax: number;
  discount: number;
  total: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  workOrder?: WorkOrder;
  customer?: Customer;
  payments?: Payment[];
  createdAt?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: string;
  amount: number;
  receivedAt: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  jobId?: string;
  employee?: Employee;
}

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API methods
export const api = {
  auth: {
    login: (payload: { email: string; password: string }) =>
      request<{ token: string; role: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    seedAdmin: (payload: { email: string; password: string }) =>
      request<{ id: string; email: string }>('/auth/seed-admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  customers: {
    list: () => request<Customer[]>('/customers'),
    get: (id: string) => request<Customer>(`/customers/${id}`),
    create: (payload: Partial<Customer>) =>
      request<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    addVehicle: (customerId: string, payload: Partial<Vehicle>) =>
      request<Vehicle>(`/customers/${customerId}/vehicles`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  workOrders: {
    list: () => request<WorkOrder[]>('/work-orders'),
    get: (id: string) => request<WorkOrder>(`/work-orders/${id}`),
    create: (payload: Partial<WorkOrder>) =>
      request<WorkOrder>('/work-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateStatus: (id: string, status: string) =>
      request<WorkOrder>(`/work-orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    assign: (id: string, employeeId: string) =>
      request(`/work-orders/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ employeeId }),
      }),
    addLabor: (id: string, payload: { employeeId: string; hours: number; rate: number; note?: string }) =>
      request(`/work-orders/${id}/labor`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    addParts: (id: string, payload: { partId: string; quantity: number; unitPrice: number; markupPct?: number }) =>
      request(`/work-orders/${id}/parts`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  inventory: {
    list: () => request<Part[]>('/inventory'),
    create: (payload: Partial<Part>) =>
      request<Part>('/inventory', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    adjust: (id: string, quantity: number) =>
      request<Part>(`/inventory/${id}/adjust`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      }),
    lowStock: () => request<Part[]>('/inventory/low-stock'),
  },
  invoices: {
    list: () => request<Invoice[]>('/invoices'),
    get: (id: string) => request<Invoice>(`/invoices/${id}`),
    create: (workOrderId: string) =>
      request<Invoice>('/invoices', {
        method: 'POST',
        body: JSON.stringify({ workOrderId }),
      }),
    pay: (id: string, payload: { method: string; amount: number }) =>
      request<Invoice>(`/invoices/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  employees: {
    list: () => request<Employee[]>('/employees'),
    create: (payload: Partial<Employee> & { email: string; password: string }) =>
      request<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  time: {
    clockIn: (payload: { employeeId: string }) =>
      request<TimeEntry>('/time/clock-in', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    clockOut: (id: string) =>
      request<TimeEntry>(`/time/clock-out/${id}`, {
        method: 'POST',
      }),
    timesheet: (employeeId: string) =>
      request<TimeEntry[]>(`/time/timesheet/${employeeId}`),
  },
  reports: {
    revenue: (params?: { from?: string; to?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.from) searchParams.set('from', params.from);
      if (params?.to) searchParams.set('to', params.to);
      const query = searchParams.toString();
      return request<{ total: number; count: number }>(`/reports/revenue${query ? `?${query}` : ''}`);
    },
    productivity: (employeeId: string) =>
      request<{ totalHours: number }>(`/reports/productivity/${employeeId}`),
    payroll: (employeeId: string) =>
      request<{ hours: number; rate: number; grossPay: number }>(`/reports/payroll/${employeeId}`),
  },
};
