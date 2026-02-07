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

// Time Clock types
export type PunchType = 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
export type PunchMethod = 'APP' | 'PIN' | 'QR_CODE' | 'FACIAL' | 'MANUAL' | 'KIOSK';
export type AttendanceStatus = 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PunchRecord {
  id: string;
  type: PunchType;
  timestamp: string;
  employee: {
    id: string;
    name: string;
  };
  shop: {
    id: string;
    name: string;
  } | null;
  location?: {
    latitude: number | null;
    longitude: number | null;
    isWithinGeofence?: boolean | null;
  };
}

export interface CurrentShift {
  clockInTime: string;
  shop: {
    id: string;
    name: string;
  } | null;
  elapsedMinutes: number;
  breakMinutes: number;
  workMinutes: number;
  elapsedFormatted: string;
  workFormatted: string;
  breakFormatted: string;
}

export interface AttendanceStatusResponse {
  status: AttendanceStatus;
  isClockedIn: boolean;
  isOnBreak: boolean;
  lastPunch: PunchRecord | null;
  currentShift: CurrentShift | null;
  todayPunches?: PunchRecord[];
}

export interface ClockInRequest {
  employeeId: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  photoUrl?: string;
  punchMethod?: PunchMethod;
  deviceInfo?: string;
  shopId?: string;
}

export interface ClockOutRequest {
  employeeId: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  punchMethod?: PunchMethod;
  deviceInfo?: string;
}

export interface BreakRequest {
  employeeId: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  breakType?: 'LUNCH' | 'REST' | 'OTHER';
  punchMethod?: PunchMethod;
  deviceInfo?: string;
}

export interface ClockInResponse {
  success: boolean;
  punch: PunchRecord;
  message: string;
}

export interface ClockOutResponse {
  success: boolean;
  punch: PunchRecord;
  shiftSummary: {
    clockIn: string;
    clockOut: string;
    totalMinutes: number;
    breakMinutes: number;
    workMinutes: number;
    formatted: string;
  };
  message: string;
}

export interface BreakStartResponse {
  success: boolean;
  punch: PunchRecord;
  breakType: string;
  message: string;
}

export interface BreakEndResponse {
  success: boolean;
  punch: PunchRecord;
  breakSummary: {
    startTime: string;
    endTime: string;
    durationMinutes: number;
    formatted: string;
  };
  message: string;
}

export interface GeofenceErrorResponse {
  error: string;
  message: string;
  distance: number;
}
