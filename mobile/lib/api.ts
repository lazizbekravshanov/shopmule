import { getToken, clearAuth } from './storage';
import type {
  LoginCredentials,
  LoginResponse,
  Vehicle,
  VehicleSearchResult,
  VINDecodeResult,
  WorkOrder,
  CreateWorkOrderInput,
  CreateVehicleInput,
  Customer,
  APIError,
} from '@/types';

// Configure base URL - update this for production
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private onUnauthorized?: () => void;

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await clearAuth();
      this.onUnauthorized?.();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/mobile/auth', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Vehicles
  async searchVehicleByVIN(vin: string): Promise<VehicleSearchResult | null> {
    try {
      return await this.request<VehicleSearchResult>(
        `/api/vehicles/search?vin=${encodeURIComponent(vin)}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async decodeVIN(vin: string): Promise<VINDecodeResult> {
    return this.request<VINDecodeResult>(
      `/api/vin/decode?vin=${encodeURIComponent(vin)}`
    );
  }

  async createVehicle(
    customerId: string,
    data: CreateVehicleInput
  ): Promise<Vehicle> {
    return this.request<Vehicle>(`/api/customers/${customerId}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVehicle(id: string): Promise<Vehicle> {
    return this.request<Vehicle>(`/api/vehicles/${id}`);
  }

  // Work Orders
  async getVehicleWorkOrders(vehicleId: string): Promise<WorkOrder[]> {
    return this.request<WorkOrder[]>(
      `/api/work-orders?vehicleId=${vehicleId}`
    );
  }

  async createWorkOrder(data: CreateWorkOrderInput): Promise<WorkOrder> {
    return this.request<WorkOrder>('/api/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkOrder(id: string): Promise<WorkOrder> {
    return this.request<WorkOrder>(`/api/work-orders/${id}`);
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/api/customers');
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.request<Customer>(`/api/customers/${id}`);
  }
}

export const api = new ApiClient();

// Helper to extract error message from API errors
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
