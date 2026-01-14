/**
 * Local Backend API Service for Driver App
 * Connects to local PostgreSQL via Express backend.
 */

import { Order, OrderStage, Earnings } from '../types';
import ENV_CONFIG, { logDev } from '../config/environment';
import StorageService from './storage.service';

const API_URL = ENV_CONFIG.apiUrl;

class LocalApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  // Core request method with auth header and token refresh
  private async request(endpoint: string, options: RequestInit = {}, retry = true): Promise<any> {
    // Get access token for protected routes
    const token = await StorageService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retry) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        return this.request(endpoint, options, false);
      }
      // Refresh failed - clear auth and throw
      await StorageService.clearAuth();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      // Handle different error response formats
      const errorMessage = data.error?.message || data.message || `Request failed (${response.status})`;
      console.error('[LocalAPI] Request error:', endpoint, response.status, errorMessage);
      throw new Error(errorMessage);
    }

    // Handle different response formats: {success, data} or {order} or raw data
    return data.data ?? data.order ?? data;
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh calls
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<boolean> {
    try {
      const refreshToken = await StorageService.getRefreshToken();
      if (!refreshToken) {
        logDev('[LocalAPI] No refresh token available');
        return false;
      }

      const response = await fetch(`${API_URL}/auth/mobile/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store new tokens
        await StorageService.setToken(data.data.accessToken);
        if (data.data.refreshToken) {
          await StorageService.setRefreshToken(data.data.refreshToken);
        }
        logDev('[LocalAPI] Token refreshed successfully');
        return true;
      }

      logDev('[LocalAPI] Token refresh failed:', data.message);
      return false;
    } catch (error) {
      console.error('[LocalAPI] Token refresh error:', error);
      return false;
    }
  }

  // ============================================
  // Orders
  // ============================================

  // Map backend order response (camelCase) to driver app format (snake_case)
  private mapOrder(o: any): any {
    if (!o) return null;

    // Map stage from Prisma enum to driver app enum
    // CONFIRMED/PICKED_UP = driver accepted and is on the way
    // DELIVERING = driver arrived at location
    const stageMap: Record<string, string> = {
      'PENDING': OrderStage.IN_QUEUE,
      'CONFIRMED': OrderStage.COURIER_ON_THE_WAY,
      'PREPARING': OrderStage.COURIER_ON_THE_WAY,
      'READY': OrderStage.COURIER_ON_THE_WAY,
      'PICKED_UP': OrderStage.COURIER_ON_THE_WAY,
      'DELIVERING': OrderStage.COURIER_ARRIVED,
      'DELIVERED': OrderStage.DELIVERED,
      'CANCELLED': OrderStage.CANCELLED,
    };

    const mappedStage = stageMap[o.stage] || o.stage || OrderStage.IN_QUEUE;

    return {
      id: o.id,
      order_number: o.orderNumber || o.order_number,
      stage: mappedStage,
      total: o.total || 0,
      delivery_fee: o.deliveryFee || o.delivery_fee || 0,
      payment_method: o.paymentMethod || o.payment_method || 'CASH',
      preferred_delivery_time: o.preferredDeliveryTime || o.preferred_delivery_time || null,
      created_at: o.createdAt || o.created_at,
      delivered_at: o.deliveredAt || o.delivered_at || null,
      // Map nested objects to snake_case keys expected by UI
      // If user has no name, use phone as fallback display name
      users: (o.users || o.user) ? (() => {
        const user = o.users || o.user;
        return {
          id: user.id,
          name: user.name || user.client_profiles?.name || user.phone || 'Customer',
          phone: user.phone || null,
        };
      })() : null,
      addresses: (o.addresses || o.address) ? (() => {
        const addr = o.addresses || o.address;
        return {
          id: addr.id,
          title: addr.title || addr.address || '',
          address: addr.address || '',
          latitude: addr.latitude || null,
          longitude: addr.longitude || null,
          type: addr.type || null,
          floor: addr.floor || null,
        };
      })() : null,
      firms: (o.firms || o.firm) ? (() => {
        const firm = o.firms || o.firm;
        return {
          id: firm.id,
          name: firm.name || '',
          logo_url: firm.logoUrl || firm.logo_url || null,
          phone: firm.phone || null,
        };
      })() : null,
      // Map items with snake_case field names
      items: (o.items || []).map((item: any) => ({
        id: item.id,
        product_name: item.productName || item.product_name || item.product?.name || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        product_image: item.product?.imageUrl || item.productImage || item.product_image || null,
      })),
    };
  }

  async getActiveOrders(driverId: string): Promise<Order[]> {
    logDev('[LocalAPI] Getting active orders for driver:', driverId);
    const orders = await this.request(`/drivers/${driverId}/orders?status=IN_QUEUE`);
    return (orders || []).map((o: any) => this.mapOrder(o));
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    logDev('[LocalAPI] Getting order by ID:', orderId);
    const order = await this.request(`/orders/${orderId}`);
    return this.mapOrder(order);
  }

  async acceptOrder(orderId: string, driverId: string): Promise<void> {
    logDev('[LocalAPI] Accepting order:', orderId, 'by driver:', driverId);
    await this.request(`/orders/${orderId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ driverId }),
    });
  }

  async updateOrderStatus(orderId: string, stage: OrderStage): Promise<void> {
    logDev('[LocalAPI] Updating order status:', orderId, 'to:', stage);

    // Map driver app stage to backend (Prisma) stage
    const stageToBackendMap: Record<string, string> = {
      [OrderStage.ORDER_PLACED]: 'PENDING',
      [OrderStage.IN_QUEUE]: 'PENDING',
      [OrderStage.COURIER_ON_THE_WAY]: 'PICKED_UP',
      [OrderStage.COURIER_ARRIVED]: 'DELIVERING',
      [OrderStage.DELIVERED]: 'DELIVERED',
      [OrderStage.CANCELLED]: 'CANCELLED',
    };

    const backendStage = stageToBackendMap[stage] || stage;
    logDev('[LocalAPI] Mapped to backend stage:', backendStage);

    await this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ stage: backendStage }),
    });
  }

  async getOrderHistory(driverId: string, limit = 50): Promise<Order[]> {
    logDev('[LocalAPI] Getting order history for driver:', driverId);
    const orders = await this.request(`/drivers/${driverId}/orders?status=DELIVERED&limit=${limit}`);
    return (orders || []).map((o: any) => this.mapOrder(o));
  }

  // ============================================
  // Driver Profile
  // ============================================

  async getDriverProfile(driverId: string): Promise<any> {
    logDev('[LocalAPI] Getting driver profile:', driverId);
    const data = await this.request(`/drivers/${driverId}`);

    // Map backend response to driver app format
    // Backend returns nested user object and camelCase fields
    // Rating comes as Decimal from Prisma, need to parse it as number
    const rating = data.rating ? parseFloat(String(data.rating)) : 5.0;

    return {
      id: data.id,
      name: data.user?.name || data.name || '',
      phone: data.user?.phone || data.phone || '',
      photo_url: data.photo_url || data.user?.photoUrl || null,
      rating: rating,
      driver_number: data.driverNumber || data.driver_number || '',
      vehicle_number: data.vehicleNumber || data.vehicle_number || '',
      vehicle_model: data.carBrand || data.car_brand || '',
      vehicle_brand: data.carBrand || data.car_brand || '',
      vehicle_color: data.carColor || data.car_color || '',
      is_available: data.isAvailable ?? data.is_available ?? false,
      is_active: data.isActive ?? data.is_active ?? data.isAvailable ?? false,
      current_latitude: data.currentLatitude || data.current_latitude || null,
      current_longitude: data.currentLongitude || data.current_longitude || null,
      role: 'driver',
      district: data.district || '',
      firm_id: data.firmId || data.firm_id || null,
      firm_name: data.firms?.name || data.firm?.name || data.firm_name || '',
      firm_logo_url: data.firms?.logo_url || data.firm?.logo_url || null,
      driver_license_photo: null,
      driver_id_photo: null,
      vehicle_documents_photo: null,
    };
  }

  async updateDriverOnlineStatus(driverId: string, isOnline: boolean): Promise<void> {
    logDev('[LocalAPI] Updating driver online status:', driverId, isOnline);
    await this.request(`/drivers/${driverId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isOnline }),
    });
  }

  async updateDriverLocation(driverId: string, latitude: number, longitude: number): Promise<void> {
    logDev('[LocalAPI] Updating driver location:', driverId);
    await this.request(`/drivers/${driverId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ lat: latitude, lng: longitude }),
    });
  }

  // ============================================
  // Earnings
  // ============================================

  async getEarnings(driverId: string): Promise<Earnings> {
    logDev('[LocalAPI] Getting earnings for driver:', driverId);
    try {
      return await this.request(`/drivers/${driverId}/earnings`);
    } catch {
      // Return default earnings if endpoint not implemented
      return {
        today: 0,
        week: 0,
        month: 0,
        total_deliveries: 0,
      };
    }
  }

  // ============================================
  // Authentication
  // ============================================

  async sendCode(phone: string): Promise<void> {
    logDev('[LocalAPI] Sending verification code to:', phone);
    await fetch(`${API_URL}/auth/mobile/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role: 'driver' }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send code');
      }
    });
  }

  async verifyCode(phone: string, code: string): Promise<{
    user: { id: string; phone: string; role: string };
    accessToken: string;
    refreshToken: string;
  }> {
    logDev('[LocalAPI] Verifying code for:', phone);
    const response = await fetch(`${API_URL}/auth/mobile/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, role: 'driver' }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid verification code');
    }

    // Store tokens
    await StorageService.setToken(data.data.accessToken);
    await StorageService.setRefreshToken(data.data.refreshToken);

    return data.data;
  }

  async logout(): Promise<void> {
    logDev('[LocalAPI] Logging out');
    await StorageService.clearAuth();
  }

  async verifyDriverRole(userId: string): Promise<boolean> {
    logDev('[LocalAPI] Verifying driver role:', userId);
    try {
      const profile = await this.request(`/user/profile/${userId}`);
      return profile?.role === 'driver';
    } catch {
      return false;
    }
  }

  async updateDriverName(driverId: string, name: string): Promise<void> {
    logDev('[LocalAPI] Updating driver name:', driverId, name);
    await this.request(`/user/profile/${driverId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async updateDriverDistrict(driverId: string, district: string): Promise<void> {
    logDev('[LocalAPI] Updating driver district:', driverId, district);
    await this.request(`/drivers/${driverId}/district`, {
      method: 'PUT',
      body: JSON.stringify({ district }),
    });
  }
}

export default new LocalApiService();
