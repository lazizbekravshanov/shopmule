// User and Auth types
export type Role = 'ADMIN' | 'MANAGER' | 'MECHANIC' | 'FRONT_DESK';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  billingAddress?: string | null;
}

// Vehicle types
export interface Vehicle {
  id: string;
  vin: string;
  unitNumber?: string | null;
  make: string;
  model: string;
  year?: number | null;
  mileage?: number | null;
  licensePlate?: string | null;
  customerId: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

// Work Order types
export type WorkOrderStatus = 'DIAGNOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';

export interface WorkOrder {
  id: string;
  vehicleId: string;
  status: WorkOrderStatus;
  description: string;
  checklist?: string | null;
  notes?: string | null;
  laborHours: number;
  partsTotal: number;
  laborRate: number;
  vehicle?: Vehicle;
  createdAt: string;
  updatedAt: string;
}

// VIN decode result from NHTSA
export interface VINDecodeResult {
  vin: string;
  make: string;
  model: string;
  year: number;
  vehicleType?: string;
  manufacturer?: string;
  plantCountry?: string;
  errorCode?: string;
  errorText?: string;
}

// API response types
export interface VehicleSearchResult {
  vehicle: Vehicle;
  workOrders: WorkOrder[];
}

export interface CreateWorkOrderInput {
  vehicleId: string;
  description: string;
  notes?: string;
  checklist?: string;
}

export interface CreateVehicleInput {
  vin: string;
  make: string;
  model: string;
  year?: number;
  mileage?: number;
  unitNumber?: string;
  licensePlate?: string;
}

// Login types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// API Error
export interface APIError {
  error: string;
  details?: Record<string, string[]>;
}
