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
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = 'Request failed';
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || message;
    } catch {
      message = text || message;
    }
    throw new ApiError(message, res.status);
  }

  const json = await res.json();

  // Handle wrapped responses { success: true, data: ... }
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

// Types
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface CertificationData {
  id: string;
  name: string;
  issuingOrg?: string | null;
  certNumber?: string | null;
  level?: string | null;
  issuedDate?: string | null;
  expiryDate?: string | null;
  isActive: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  payRate: number;
  payType?: string;
  overtimeRate?: number | null;
  status: string;
  userId: string;
  email?: string;
  phoneNumber?: string | null;
  photoUrl?: string | null;
  specializations?: string[];
  hireDate?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  notes?: string | null;
  certifications?: CertificationData[];
  recentWorkOrders?: {
    id: string;
    workOrderNumber: string;
    description: string;
    status: string;
    createdAt: string;
    vehicle?: { make: string; model: string; year?: number; unitNumber?: string } | null;
  }[];
  stats?: {
    todayHours: number;
    weekHours: number;
    jobsCompleted: number;
    billableEfficiency: number;
    revenueGenerated: number;
  };
  user?: User;
  createdAt?: string;
}

export interface EmployeePerformance {
  period: string;
  periodStart: string;
  totalWorkHours: number;
  billableHours: number;
  billableEfficiency: number;
  jobsCompleted: number;
  avgJobTime: number;
  revenueGenerated: number;
  overtimeHours: number;
  dailyBreakdown: { date: string; hours: number }[];
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

export type PartsStatus = 'WAITING' | 'ORDERED' | 'IN_STOCK';

export interface WorkOrder {
  id: string;
  vehicleId: string;
  status: 'DIAGNOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  description: string;
  checklist?: string | null;
  notes?: string | null;
  partsStatus?: PartsStatus | null;
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

export interface WorkOrderSummary {
  total: number;
  open: number;
  activeCustomers: number;
  byStatus: Record<string, number>;
  recent: Array<{
    id: string;
    status: WorkOrder['status'];
    description: string;
    vehicle?: {
      make?: string;
      model?: string;
      customerId: string;
    };
  }>;
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
  note?: string | null;
  startedAt?: string | null;
  stoppedAt?: string | null;
  actualHours?: number | null;
  employee?: Employee;
}

export interface DeferredWorkItem {
  id: string;
  vehicleId: string;
  description: string;
  category?: string | null;
  estimatedCost?: number | null;
  declinedAt: string;
  declinedReason?: string | null;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'DISMISSED';
  resolvedAt?: string | null;
  sourceWorkOrderId?: string | null;
  resolvedWorkOrderId?: string | null;
  createdAt: string;
}

export interface ServiceTemplateLine {
  id?: string;
  type: 'LABOR' | 'PART' | 'SUBLET' | 'FEE' | 'NOTE';
  description: string;
  quantity: number;
  unitPrice: number;
  laborHours?: number | null;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  flatRatePrice?: number | null;
  laborHours?: number | null;
  lines: ServiceTemplateLine[];
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

export interface PartSearchResult {
  inventory: Part[];
  catalog: {
    sku: string;
    name: string;
    category: string;
    supplier: string;
    brand: string;
    cost: number;
    price: number;
    notes?: string;
  }[];
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
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeStatus?: string;
}

export interface CreatePaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  remainingBalance: number;
}

export interface CreatePaymentIntentResponse {
  success: true;
  data: CreatePaymentIntentData;
}

export interface GeneratePaymentLinkData {
  paymentLink: string;
  expiresAt: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface GeneratePaymentLinkResponse {
  success: true;
  data: GeneratePaymentLinkData;
}

export interface InvoiceAgingBucket {
  count: number;
  total: number;
  invoiceIds: string[];
}

export interface InvoiceAgingOverdue {
  id: string;
  balance: number;
  age: number;
  customer: { id: string; name: string; phone?: string | null; email?: string | null } | null;
}

export interface InvoiceAgingSummary {
  buckets: {
    current: InvoiceAgingBucket;
    overdue31: InvoiceAgingBucket;
    overdue61: InvoiceAgingBucket;
    overdue90: InvoiceAgingBucket;
  };
  totalOutstanding: number;
  overdueInvoices: InvoiceAgingOverdue[];
}

export interface ReportBreakdown {
  summary: {
    totalRevenue: number;
    invoiceCount: number;
    avgTicket: number;
    laborRevenue: number;
    partsRevenue: number;
    laborPct: number;
    partsPct: number;
    revenueChange: number;
    prevRevenue: number;
  };
  monthly: { month: string; revenue: number; labor: number; parts: number }[];
  techPerformance: { name: string; hours: number; revenue: number }[];
  range: string;
  from: string;
  to: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  jobId?: string;
  employee?: Employee;
}

export interface TechEfficiency {
  id: string;
  name: string;
  role: string;
  photoUrl?: string | null;
  clockedHours: number;
  billedHours: number;
  efficiency: number;
  revenue: number;
  jobsCompleted: number;
  isClockedIn: boolean;
}

export interface EfficiencyReport {
  period: string;
  periodStart: string;
  summary: {
    shopEfficiency: number;
    totalBilledHours: number;
    totalClockedHours: number;
    totalRevenue: number;
    techCount: number;
  };
  technicians: TechEfficiency[];
}

// Payroll types
export interface DeductionItem {
  id: string;
  type: string;
  description: string;
  amount: number;
  percentage?: number | null;
  isRecurring: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LoanItem {
  id: string;
  description: string;
  originalAmount: number;
  remainingBalance: number;
  monthlyPayment: number;
  issuedDate: string;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface PayrollEmployeeRow {
  id: string;
  name: string;
  role: string;
  payType: string;
  payRate: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  totalDeductions: number;
  loanRepayments: number;
  netPay: number;
}

export interface PayrollSummary {
  period: string;
  periodStart: string;
  totals: {
    grossPay: number;
    totalDeductions: number;
    loanRepayments: number;
    netPay: number;
    regularHours: number;
    overtimeHours: number;
    employeeCount: number;
  };
  employees: PayrollEmployeeRow[];
}

export interface DailyBreakdownRow {
  date: string;
  clockIn?: string | null;
  clockOut?: string | null;
  regularHours: number;
  overtimeHours: number;
  pay: number;
}

export interface DeductionBreakdownItem {
  id: string;
  type: string;
  description: string;
  amount: number;
}

export interface EmployeePayrollDetail {
  employee: {
    id: string;
    name: string;
    role: string;
    payRate: number;
    payType: string;
    overtimeRate?: number | null;
  };
  period: string;
  periodStart: string;
  pay: {
    regularPay: number;
    overtimePay: number;
    grossPay: number;
    totalDeductions: number;
    loanRepayments: number;
    netPay: number;
  };
  deductionBreakdown: DeductionBreakdownItem[];
  dailyBreakdown: DailyBreakdownRow[];
  regularHours: number;
  overtimeHours: number;
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
    list: (params?: { limit?: number; offset?: number; fields?: string[] }) => {
      const searchParams = new URLSearchParams();
      if (params?.limit !== undefined) {
        searchParams.set('limit', String(params.limit));
      }
      if (params?.offset !== undefined) {
        searchParams.set('offset', String(params.offset));
      }
      if (params?.fields?.length) {
        searchParams.set('fields', params.fields.join(','));
      }
      const query = searchParams.toString();
      return request<WorkOrder[]>(`/work-orders${query ? `?${query}` : ''}`);
    },
    summary: (limit = 5) =>
      request<WorkOrderSummary>(`/work-orders?summary=true&limit=${limit}`),
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
    patch: (id: string, payload: { checklist?: string | null; notes?: string; partsStatus?: PartsStatus | null }) =>
      request<{ id: string; checklist: string | null; notes: string | null; partsStatus: PartsStatus | null }>(`/work-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    addLabor: (id: string, payload: { employeeId?: string; hours: number; rate: number; note?: string }) =>
      request(`/work-orders/${id}/labor`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    startLaborTimer: (workOrderId: string, laborId: string) =>
      request(`/work-orders/${workOrderId}/labor/${laborId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'start' }),
      }),
    stopLaborTimer: (workOrderId: string, laborId: string) =>
      request(`/work-orders/${workOrderId}/labor/${laborId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'stop' }),
      }),
    updateLabor: (
      workOrderId: string,
      laborId: string,
      payload: { hours?: number; rate?: number; note?: string }
    ) =>
      request(`/work-orders/${workOrderId}/labor/${laborId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    deleteLabor: (workOrderId: string, laborId: string) =>
      request(`/work-orders/${workOrderId}/labor/${laborId}`, {
        method: 'DELETE',
      }),
    addParts: (
      id: string,
      payload: (
        | { partId: string; quantity: number; unitPrice: number; markupPct?: number }
        | { sku: string; name: string; category?: string; brand?: string; supplier?: string; quantity: number; unitPrice: number; markupPct?: number }
      )
    ) =>
      request(`/work-orders/${id}/parts`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  parts: {
    search: (q: string) =>
      request<PartSearchResult>(`/parts/search?q=${encodeURIComponent(q)}`),
  },
  deferred: {
    list: (vehicleId: string) =>
      request<DeferredWorkItem[]>(`/vehicles/${vehicleId}/deferred`),
    create: (
      vehicleId: string,
      payload: {
        description: string;
        category?: string | null;
        estimatedCost?: number | null;
        declinedReason?: string | null;
        sourceWorkOrderId?: string | null;
      }
    ) =>
      request<DeferredWorkItem>(`/vehicles/${vehicleId}/deferred`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    patch: (
      id: string,
      payload: {
        status?: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'DISMISSED';
        resolvedWorkOrderId?: string | null;
      }
    ) =>
      request<{ id: string; status: string; resolvedAt: string | null }>(`/deferred/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },
  templates: {
    list: () => request<ServiceTemplate[]>('/templates'),
    get: (id: string) => request<ServiceTemplate>(`/templates/${id}`),
    create: (payload: Omit<ServiceTemplate, 'id'>) =>
      request<ServiceTemplate>('/templates', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Omit<ServiceTemplate, 'id'>>) =>
      request<ServiceTemplate>(`/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/templates/${id}`, { method: 'DELETE' }),
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
    lowStockCount: () => request<{ count: number }>('/inventory/low-stock?countOnly=true'),
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
    createPaymentIntent: (invoiceId: string, amount?: number) =>
      request<CreatePaymentIntentResponse>('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ invoiceId, amount }),
      }),
    generatePaymentLink: (invoiceId: string) =>
      request<GeneratePaymentLinkResponse>(`/invoices/${invoiceId}/payment-link`, {
        method: 'POST',
      }),
    aging: () => request<InvoiceAgingSummary>('/invoices/aging'),
    sendReminder: (invoiceId: string, channels: ('email' | 'sms')[] = ['email', 'sms']) =>
      request<{ success: boolean }>(`/invoices/${invoiceId}/send-payment-link`, {
        method: 'POST',
        body: JSON.stringify({ channels }),
      }),
  },
  employees: {
    list: (params?: { role?: string; status?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.role) searchParams.set('role', params.role);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return request<Employee[]>(`/employees${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<Employee>(`/employees/${id}`),
    create: (payload: Partial<Employee> & { email: string; password: string }) =>
      request<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Employee>) =>
      request<Employee>(`/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/employees/${id}`, { method: 'DELETE' }),
    certifications: {
      list: (id: string) => request<CertificationData[]>(`/employees/${id}/certifications`),
      add: (id: string, payload: Omit<CertificationData, 'id' | 'isActive'>) =>
        request<CertificationData>(`/employees/${id}/certifications`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      remove: (id: string, certId: string) =>
        request<{ success: boolean }>(`/employees/${id}/certifications/${certId}`, {
          method: 'DELETE',
        }),
    },
    performance: (id: string, period?: string) =>
      request<EmployeePerformance>(`/employees/${id}/performance${period ? `?period=${period}` : ''}`),
    deductions: {
      list: (id: string) => request<DeductionItem[]>(`/employees/${id}/deductions`),
      create: (id: string, payload: Omit<DeductionItem, 'id' | 'createdAt'>) =>
        request<DeductionItem>(`/employees/${id}/deductions`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      update: (id: string, deductionId: string, payload: Partial<DeductionItem>) =>
        request<DeductionItem>(`/employees/${id}/deductions/${deductionId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
      delete: (id: string, deductionId: string) =>
        request<{ success: boolean }>(`/employees/${id}/deductions/${deductionId}`, {
          method: 'DELETE',
        }),
    },
    loans: {
      list: (id: string) => request<LoanItem[]>(`/employees/${id}/loans`),
      create: (id: string, payload: Omit<LoanItem, 'id' | 'createdAt'>) =>
        request<LoanItem>(`/employees/${id}/loans`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      update: (id: string, loanId: string, payload: Partial<LoanItem>) =>
        request<LoanItem>(`/employees/${id}/loans/${loanId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
    },
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
    breakdown: (range: string) =>
      request<ReportBreakdown>(`/reports/breakdown?range=${encodeURIComponent(range)}`),
    productivity: (employeeId: string) =>
      request<{ totalHours: number }>(`/reports/productivity/${employeeId}`),
    payroll: (employeeId: string) =>
      request<{ hours: number; rate: number; grossPay: number }>(`/reports/payroll/${employeeId}`),
  },
  payroll: {
    summary: (period: string) =>
      request<PayrollSummary>(`/payroll?period=${encodeURIComponent(period)}`),
    employee: (id: string, period: string) =>
      request<EmployeePayrollDetail>(`/payroll/${id}?period=${encodeURIComponent(period)}`),
  },
  efficiency: {
    get: (period: string) =>
      request<EfficiencyReport>(`/efficiency?period=${encodeURIComponent(period)}`),
  },
};
