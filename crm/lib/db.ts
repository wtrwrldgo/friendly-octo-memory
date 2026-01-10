// file: lib/db.ts
// Database client wrapper - uses local PostgreSQL backend

const LOCAL_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://45.92.173.121/api';

interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

// Options that can be passed to db functions (for server-side auth token)
export interface DbRequestOptions {
  authToken?: string;
}

// Get auth token from localStorage (client-side only)
// For server-side, the API routes read from cookies and pass via options
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Check both possible keys for compatibility
  return localStorage.getItem('auth_token') || localStorage.getItem('authToken');
}

// Local API helper - accepts optional authToken for server-side use
async function localRequest<T>(endpoint: string, options: RequestInit = {}, authToken?: string): Promise<QueryResult<T>> {
  try {
    // Use provided authToken (from server-side), or fall back to localStorage (client-side)
    const token = authToken || getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${LOCAL_API_URL}${endpoint}`;
    console.log('[db.ts] Fetching:', url);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result = await response.json();

    console.log('[db.ts] Response for', endpoint, ':', {
      ok: response.ok,
      success: result.success,
      dataLength: result.data?.length,
      firstItem: result.data?.[0] ? JSON.stringify(result.data[0]).substring(0, 200) : null
    });

    if (!response.ok || !result.success) {
      return { data: null, error: new Error(result.error?.message || result.message || 'Request failed') };
    }

    return { data: result.data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

// Database client with methods for local backend
export const db = {
  // Firms
  async getFirms() {
    return localRequest<any[]>('/firms');
  },

  async getFirmById(id: string) {
    return localRequest<any>(`/firms/${id}`);
  },

  async createFirm(firmData: any) {
    return localRequest<any>('/firms', {
      method: 'POST',
      body: JSON.stringify(firmData),
    });
  },

  async updateFirm(id: string, updates: any, options?: DbRequestOptions) {
    return localRequest<any>(`/firms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, options?.authToken);
  },

  async deleteFirm(id: string, options?: DbRequestOptions) {
    return localRequest<any>(`/firms/${id}`, { method: 'DELETE' }, options?.authToken);
  },

  // Products
  async getProducts(firmId?: string) {
    const query = firmId ? `?firmId=${firmId}` : '';
    return localRequest<any[]>(`/products${query}`);
  },

  async createProduct(productData: any, options?: DbRequestOptions) {
    // Convert snake_case to camelCase for local backend
    const payload = {
      firmId: productData.firm_id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      imageUrl: productData.image_url,
      volume: productData.volume,
      inStock: productData.in_stock,
    };
    return localRequest<any>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, options?.authToken);
  },

  async updateProduct(id: string, updates: any, options?: DbRequestOptions) {
    // Convert snake_case to camelCase for local backend
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.image_url !== undefined) payload.imageUrl = updates.image_url;
    if (updates.volume !== undefined) payload.volume = updates.volume;
    if (updates.in_stock !== undefined) payload.inStock = updates.in_stock;

    return localRequest<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, options?.authToken);
  },

  async deleteProduct(id: string, options?: DbRequestOptions) {
    return localRequest<any>(`/products/${id}`, { method: 'DELETE' }, options?.authToken);
  },

  // Orders
  async getOrders(firmId?: string, branchId?: string, canAccessAllBranches?: boolean) {
    const params = new URLSearchParams();
    if (firmId) params.append('firmId', firmId);
    if (branchId) params.append('branchId', branchId);
    if (canAccessAllBranches) params.append('canAccessAllBranches', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return localRequest<any[]>(`/orders${query}`);
  },

  async getOrderById(id: string) {
    return localRequest<any>(`/orders/${id}`);
  },

  async updateOrderStatus(id: string, stage: string) {
    return localRequest<any>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ stage }),
    });
  },

  async createOrder(orderData: {
    userId: string;
    firmId: string;
    items: Array<{ productId: string; quantity: number }>;
    total: number;
    address?: string;
    addressId?: string;
    paymentMethod?: 'CASH' | 'CARD';
  }) {
    return localRequest<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Drivers
  async getDrivers(firmId?: string, branchId?: string, canAccessAllBranches?: boolean, options?: DbRequestOptions) {
    const params = new URLSearchParams();
    if (firmId) params.append('firmId', firmId);
    if (branchId) params.append('branchId', branchId);
    if (canAccessAllBranches) params.append('canAccessAllBranches', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return localRequest<any[]>(`/drivers${query}`, {}, options?.authToken);
  },

  async getDriverById(id: string) {
    return localRequest<any>(`/drivers/${id}`);
  },

  async createDriver(driverData: {
    firmId: string;
    name: string;
    phone: string;
    car_plate?: string;
    car_brand?: string;
    car_color?: string;
    city?: string;
    driver_number?: number;
  }, options?: DbRequestOptions) {
    // Convert snake_case to camelCase for local backend
    const payload = {
      firmId: driverData.firmId,
      name: driverData.name,
      phone: driverData.phone,
      vehicleNumber: driverData.car_plate,
      carBrand: driverData.car_brand,
      carColor: driverData.car_color,
      driverNumber: driverData.driver_number?.toString() || '0',
    };
    return localRequest<any>('/drivers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, options?.authToken);
  },

  async updateDriver(id: string, updates: {
    name?: string;
    phone?: string;
    car_plate?: string;
    car_brand?: string;
    car_color?: string;
    city?: string;
    is_available?: boolean;
  }, options?: DbRequestOptions) {
    // Convert snake_case to camelCase for local backend
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.car_plate !== undefined) payload.vehicleNumber = updates.car_plate;
    if (updates.car_brand !== undefined) payload.carBrand = updates.car_brand;
    if (updates.car_color !== undefined) payload.carColor = updates.car_color;
    if (updates.is_available !== undefined) payload.isAvailable = updates.is_available;

    return localRequest<any>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, options?.authToken);
  },

  async deleteDriver(id: string, options?: DbRequestOptions) {
    return localRequest<any>(`/drivers/${id}`, { method: 'DELETE' }, options?.authToken);
  },

  // Users/Clients
  async getClients(firmId?: string, branchId?: string, canAccessAllBranches?: boolean, options?: DbRequestOptions) {
    const params = new URLSearchParams();
    if (firmId) params.append('firmId', firmId);
    if (branchId) params.append('branchId', branchId);
    if (canAccessAllBranches) params.append('canAccessAllBranches', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return localRequest<any[]>(`/clients${query}`, {}, options?.authToken);
  },

  async getClientById(id: string, firmId?: string, options?: DbRequestOptions) {
    const params = new URLSearchParams();
    if (firmId) params.append('firmId', firmId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return localRequest<any>(`/clients/${id}${query}`, {}, options?.authToken);
  },

  async deleteClient(id: string, options?: DbRequestOptions) {
    return localRequest<any>(`/clients/${id}`, { method: 'DELETE' }, options?.authToken);
  },
};

export default db;
