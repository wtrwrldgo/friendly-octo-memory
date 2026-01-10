/**
 * Local Backend API Service
 *
 * Connects to PostgreSQL via Express backend.
 */

import StorageService from './storage.service';
import { mapServerPathToLocalAsset } from '../utils/imageMapping';
import {
  Firm,
  Product,
  Order,
  OrderStage,
  User,
  Address,
  Driver,
} from '../types';

import { API_CONFIG } from '../config/api.config';

const getBaseUrl = () => {
  return API_CONFIG.baseURL;
};

const BASE_URL = getBaseUrl();
const API_URL = BASE_URL;

// Helper to convert relative image paths to local assets or full URLs
// Prioritizes local bundled assets for offline APK support
const toLocalAssetOrUrl = (path: string | null | undefined): string | number | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path; // Already a full URL

  // Try to map to local bundled asset first (for APK offline support)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const localAsset = mapServerPathToLocalAsset(cleanPath);
  if (localAsset) return localAsset;

  // Fallback to network URL
  return `${BASE_URL}${cleanPath}`;
};

// Map backend stage (Prisma enum) to client app stage
// PENDING/IN_QUEUE = waiting for driver
// CONFIRMED/PICKED_UP = driver accepted and is on the way
// DELIVERING = driver arrived at location
const mapBackendStageToClient = (backendStage: string): OrderStage => {
  // Normalize to uppercase for case-insensitive matching
  const normalizedStage = backendStage?.toUpperCase() || '';

  const stageMap: Record<string, OrderStage> = {
    'PENDING': OrderStage.IN_QUEUE,
    'IN_QUEUE': OrderStage.IN_QUEUE,
    'CONFIRMED': OrderStage.COURIER_ON_THE_WAY,
    'PREPARING': OrderStage.COURIER_ON_THE_WAY,
    'READY': OrderStage.COURIER_ON_THE_WAY,
    'PICKED_UP': OrderStage.COURIER_ON_THE_WAY,
    'DELIVERING': OrderStage.COURIER_ARRIVED,
    'DELIVERED': OrderStage.DELIVERED,
    'CANCELLED': OrderStage.CANCELLED,
  };
  return stageMap[normalizedStage] || OrderStage.IN_QUEUE;
};

class LocalApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  // Core request method with auth header support
  private async request(endpoint: string, options: RequestInit = {}, retry = true): Promise<any> {
    // Get access token for protected routes
    const token = await StorageService.getToken();
    // Get current language for translations
    const language = await StorageService.getLanguage();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': language || 'uz',
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists (for protected endpoints)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    let data: any;

    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (networkError: any) {
      console.error('[LocalAPI] Network error:', networkError);
      throw new Error(networkError.message || 'Network error. Please check your connection.');
    }

    try {
      data = await response.json();
    } catch (jsonError: any) {
      console.error('[LocalAPI] JSON parse error:', jsonError, 'Status:', response.status);
      throw new Error('Server returned invalid response. Please try again.');
    }

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

    if (!response.ok || !data.success) {
      // Backend error response has message in data.error.message
      const errorMessage = data.error?.message || data.message || 'Request failed';
      throw new Error(errorMessage);
    }

    return data.data;
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
        console.log('[LocalAPI] No refresh token available');
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
        console.log('[LocalAPI] Token refreshed successfully');
        return true;
      }

      console.log('[LocalAPI] Token refresh failed:', data.message);
      return false;
    } catch (error) {
      console.error('[LocalAPI] Token refresh error:', error);
      return false;
    }
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string; code?: string }> {
    return this.request('/auth/mobile/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyCode(phone: string, code: string): Promise<{ token: string; user: User; isNewUser: boolean }> {
    const storedUser = await StorageService.getUser();
    const localName = storedUser?.name || 'User';

    const result = await this.request('/auth/mobile/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone, code, name: localName, role: 'client' }),
    });

    // Backend returns { accessToken, refreshToken, user, isNewUser }
    // Backend now returns role-specific name (ClientProfile.name for clients)
    await StorageService.setToken(result.accessToken);
    await StorageService.setRefreshToken(result.refreshToken);
    await StorageService.setUser(result.user);

    // Return in expected format for compatibility (including isNewUser flag)
    return { token: result.accessToken, user: result.user, isNewUser: result.isNewUser };
  }

  async logout(): Promise<{ success: boolean }> {
    await StorageService.clearAuth();
    return { success: true };
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async getUserProfile(): Promise<User> {
    const user = await StorageService.getUser();
    if (!user) throw new Error('User not found');

    return this.request(`/user/profile/${user.id}`);
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const user = await StorageService.getUser();
    if (!user) throw new Error('User not found');

    const updatedUser = await this.request(`/user/profile/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    await StorageService.setUser(updatedUser);
    return updatedUser;
  }

  // ============================================
  // ADDRESS MANAGEMENT
  // ============================================

  async getUserAddresses(): Promise<Address[]> {
    // Backend uses JWT to identify user, returns addresses for authenticated user
    const addresses = await this.request('/addresses');
    // Map backend fields (latitude/longitude) to mobile app fields (lat/lng)
    return addresses.map((addr: any) => ({
      ...addr,
      lat: addr.latitude ?? addr.lat,
      lng: addr.longitude ?? addr.lng,
    }));
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    // Map mobile app fields (lat/lng) to backend fields (latitude/longitude)
    const backendAddress = {
      title: address.title,
      address: address.address,
      latitude: address.lat,
      longitude: address.lng,
      isDefault: address.isDefault,
      addressType: address.addressType,
      entrance: address.entrance,
      floor: address.floor,
      apartment: address.apartment,
      intercom: address.intercom,
      comment: address.comment,
    };

    const savedAddress = await this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(backendAddress),
    });

    // Map response back to mobile app format
    return {
      ...savedAddress,
      lat: savedAddress.latitude ?? savedAddress.lat,
      lng: savedAddress.longitude ?? savedAddress.lng,
    };
  }

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address> {
    // Map lat/lng to latitude/longitude if present
    const backendUpdates: any = { ...updates };
    if (updates.lat !== undefined) {
      backendUpdates.latitude = updates.lat;
      delete backendUpdates.lat;
    }
    if (updates.lng !== undefined) {
      backendUpdates.longitude = updates.lng;
      delete backendUpdates.lng;
    }

    const updatedAddress = await this.request(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(backendUpdates),
    });

    return {
      ...updatedAddress,
      lat: updatedAddress.latitude ?? updatedAddress.lat,
      lng: updatedAddress.longitude ?? updatedAddress.lng,
    };
  }

  async deleteAddress(addressId: string): Promise<{ success: boolean }> {
    await this.request(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
    return { success: true };
  }

  // ============================================
  // FIRMS
  // ============================================

  async getFirms(): Promise<Firm[]> {
    // Use /firms/public endpoint - only returns ACTIVE firms visible in client app
    const firms = await this.request('/firms/public');
    // Convert logo and banner URLs to local assets (for APK) or full URLs
    // Map backend fields to client app Firm type
    return firms.map((firm: any) => ({
      id: firm.id,
      name: firm.name,
      logo: toLocalAssetOrUrl(firm.logoUrl || firm.logo_url || firm.logo) || '',
      homeBanner: toLocalAssetOrUrl(firm.homeBannerUrl || firm.home_banner_url),
      detailBanner: toLocalAssetOrUrl(firm.detailBannerUrl || firm.detail_banner_url),
      rating: parseFloat(firm.rating) || 5.0,
      deliveryTime: firm.deliveryTime || firm.delivery_time || '30-45 min',
      minOrder: parseInt(firm.minOrder || firm.min_order) || 0,
      deliveryFee: parseInt(firm.deliveryFee || firm.delivery_fee) || 0,
      bottleDeposit: parseInt(firm.bottleDeposit || firm.bottle_deposit) || 5000,
      bottleDepositEnabled: firm.bottleDepositEnabled ?? firm.bottle_deposit_enabled ?? false,
      bottleDepositPrice: parseInt(firm.bottleDepositPrice || firm.bottle_deposit_price) || 15000,
      scheduleDaysLimit: parseInt(firm.scheduleDaysLimit || firm.schedule_days_limit) || 7,
      scheduleTimeInterval: parseInt(firm.scheduleTimeInterval || firm.schedule_time_interval) || 30,
      location: firm.city || firm.location || 'Nukus',
      phone: firm.phone,
    }));
  }

  async getFirmById(firmId: string): Promise<Firm> {
    const firm = await this.request(`/firms/${firmId}`);
    return {
      id: firm.id,
      name: firm.name,
      logo: toLocalAssetOrUrl(firm.logoUrl || firm.logo_url || firm.logo) || '',
      homeBanner: toLocalAssetOrUrl(firm.homeBannerUrl || firm.home_banner_url),
      detailBanner: toLocalAssetOrUrl(firm.detailBannerUrl || firm.detail_banner_url),
      rating: parseFloat(firm.rating) || 5.0,
      deliveryTime: firm.deliveryTime || firm.delivery_time || '30-45 min',
      minOrder: parseInt(firm.minOrder || firm.min_order) || 0,
      deliveryFee: parseInt(firm.deliveryFee || firm.delivery_fee) || 0,
      bottleDeposit: parseInt(firm.bottleDeposit || firm.bottle_deposit) || 5000,
      bottleDepositEnabled: firm.bottleDepositEnabled ?? firm.bottle_deposit_enabled ?? false,
      bottleDepositPrice: parseInt(firm.bottleDepositPrice || firm.bottle_deposit_price) || 15000,
      scheduleDaysLimit: parseInt(firm.scheduleDaysLimit || firm.schedule_days_limit) || 7,
      scheduleTimeInterval: parseInt(firm.scheduleTimeInterval || firm.schedule_time_interval) || 30,
      location: firm.city || firm.location || 'Nukus',
      phone: firm.phone,
    };
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(firmId?: string): Promise<Product[]> {
    const query = firmId ? `?firmId=${firmId}` : '';
    const products = await this.request(`/products${query}`);
    // Convert image URLs to local assets (for APK) or full URLs
    return products.map((product: any) => ({
      ...product,
      image: toLocalAssetOrUrl(product.imageUrl || product.image),
    }));
  }

  async getProductById(productId: string): Promise<Product> {
    const product = await this.request(`/products/${productId}`);
    return {
      ...product,
      image: toLocalAssetOrUrl(product.imageUrl || product.image),
    };
  }

  // ============================================
  // ORDERS
  // ============================================

  // Helper to transform order data and convert image URLs
  private transformOrder(order: any): Order {
    // Map backend payment method (CASH/CARD) to client format (cash/card)
    const mapPaymentMethod = (method: string | undefined): 'cash' | 'card' | 'wallet' => {
      if (!method) return 'cash';
      const lower = method.toLowerCase();
      if (lower === 'cash' || lower === 'card') return lower;
      return 'cash';
    };

    // Transform driver data to client format
    const transformDriver = (d: any, firmName?: string) => {
      if (!d) return undefined;
      return {
        id: d.id,
        name: d.name || 'Driver',
        phone: d.phone || '',
        photo: d.photoUrl || '',
        rating: d.rating || 5.0,
        vehicleNumber: d.vehicleNumber || d.driverNumber || '',
        carBrand: d.carBrand || '',
        carColor: d.carColor || '',
        company: firmName || 'WaterGo',
      };
    };

    // Backend returns 'firms' (plural from Prisma), client expects 'firm' (singular)
    const firmData = order.firm || order.firms;
    // Backend returns 'drivers' (plural from Prisma), client expects 'driver' (singular)
    const driverData = order.driver || order.drivers;
    // Backend returns 'addresses' (plural from Prisma), client might expect 'address'
    const addressData = order.address || order.addresses;

    // Create firm object with fallback to prevent crashes
    const transformedFirm = firmData ? {
      id: firmData.id,
      name: firmData.name || 'Unknown Firm',
      logo: toLocalAssetOrUrl(firmData.logoUrl || firmData.logo_url || firmData.logo) || '',
      phone: firmData.phone,
    } : {
      id: order.firm_id || '',
      name: 'Unknown Firm',
      logo: '',
    };

    return {
      ...order,
      // Map snake_case to camelCase for key fields
      orderNumber: order.order_number || order.orderNumber,
      // Map backend stage to client app stage
      stage: mapBackendStageToClient(order.stage),
      // Map backend payment method to client format
      paymentMethod: mapPaymentMethod(order.payment_method || order.paymentMethod),
      // Transform driver data
      driver: transformDriver(driverData, transformedFirm.name),
      // Use transformed firm
      firm: transformedFirm,
      // Include address data
      address: addressData,
      items: order.items?.map((item: any) => {
        // Backend returns 'products' (plural) for the product relation
        const productData = item.products || item.product;
        return {
          ...item,
          product_image: toLocalAssetOrUrl(item.product_image || item.product_imageUrl),
          product: productData ? {
            id: item.product_id || productData.id,
            name: productData.name || item.product_name,
            price: item.price,
            volume: productData.volume || '19L',
            image: toLocalAssetOrUrl(productData.image_url || productData.imageUrl || productData.image),
          } : {
            // Fallback using item-level data
            id: item.product_id,
            name: item.product_name,
            price: item.price,
            volume: '19L',
            image: undefined,
          },
        };
      }) || [],
    };
  }

  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    firmId: string;
    addressId: string;
    total: number;
    preferredDeliveryTime?: string | null;
    paymentMethod?: 'cash' | 'card';
  }): Promise<Order> {
    const user = await StorageService.getUser();
    console.log('[LocalAPI] createOrder - user from storage:', user);
    console.log('[LocalAPI] createOrder - orderData:', orderData);

    if (!user) {
      console.error('[LocalAPI] createOrder - No user found in storage');
      throw new Error('User not found. Please log in again.');
    }

    if (!user.id) {
      console.error('[LocalAPI] createOrder - User has no ID:', user);
      throw new Error('User session invalid. Please log in again.');
    }

    const requestBody = {
      ...orderData,
      userId: user.id,
      preferredDeliveryTime: orderData.preferredDeliveryTime || null,
      paymentMethod: (orderData.paymentMethod || 'cash').toUpperCase(),
    };
    console.log('[LocalAPI] createOrder - request body:', requestBody);

    const order = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    console.log('[LocalAPI] createOrder - order created:', order);
    return this.transformOrder(order);
  }

  async getOrders(): Promise<Order[]> {
    const user = await StorageService.getUser();
    if (!user) throw new Error('User not found');

    const orders = await this.request(`/orders/user/${user.id}`);
    return orders.map((order: any) => this.transformOrder(order));
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.request(`/orders/${orderId}`);
    return this.transformOrder(order);
  }

  async getOrderStatus(orderId: string): Promise<{
    stage: OrderStage;
    estimatedDelivery: Date;
    queuePosition?: number;
    ordersAhead?: number;
  }> {
    const result = await this.request(`/orders/${orderId}/status`);
    return {
      stage: mapBackendStageToClient(result.stage),
      estimatedDelivery: new Date(result.estimatedDelivery),
      queuePosition: result.queuePosition || 0,
      ordersAhead: result.ordersAhead || 0,
    };
  }

  async getOrderDriver(orderId: string): Promise<Driver | null> {
    try {
      const order = await this.request(`/orders/${orderId}`);
      if (!order.driver) return null;

      // Transform backend driver structure to client app format
      // Backend returns: { id, name, phone, driverNumber, vehicleNumber, carBrand, carColor }
      // Client expects: { id, name, phone, photo, rating, vehicleNumber, carBrand, carColor, company }
      const d = order.driver;
      return {
        id: d.id,
        name: d.name || 'Driver',
        phone: d.phone || '',
        photo: d.photoUrl || '',
        rating: d.rating || 5.0,
        vehicleNumber: d.vehicleNumber || d.driverNumber || '',
        carBrand: d.carBrand || '',
        carColor: d.carColor || '',
        company: order.firm?.name || 'WaterGo',
      };
    } catch {
      return null;
    }
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    await this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
    return { success: true };
  }

  // ============================================
  // REVIEWS
  // ============================================

  async submitReview(orderId: string, rating: number, comment: string): Promise<{ success: boolean }> {
    // TODO: Implement reviews table in backend
    console.log(`[Review] Order ${orderId}: ${rating} stars - ${comment}`);
    return { success: true };
  }

  // ============================================
  // LOCATION SERVICES
  // ============================================

  async reverseGeocode(lat: number, lng: number): Promise<{ address: string }> {
    return {
      address: `Nukus, ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }

  // ============================================
  // DELIVERY AVAILABILITY
  // ============================================

  async checkDeliveryAvailability(cityName: string): Promise<{
    canDeliver: boolean;
    reason?: string;
    message?: string;
    cityName?: string;
    regionName?: string;
    branchId?: string;
    deliveryFee?: number;
    etaMinutes?: number;
  }> {
    return this.request(`/delivery/check-availability?cityName=${encodeURIComponent(cityName)}`);
  }

  // ============================================
  // PUSH NOTIFICATIONS
  // ============================================

  async registerPushToken(token: string, platform: string): Promise<{ success: boolean }> {
    await this.request('/push-tokens', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
    return { success: true };
  }

  async unregisterPushToken(token: string): Promise<{ success: boolean }> {
    await this.request('/push-tokens', {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    });
    return { success: true };
  }
}

export default new LocalApiService();
