/**
 * API Service
 *
 * Main API service that intelligently routes requests to either
 * the real backend API or mock API based on configuration.
 *
 * This is the primary interface that the app uses for all API calls.
 */

import { shouldUseMockData, shouldUseLocalBackend } from '../config/api.config';
import MockApiService from './mock-api.service';
import LocalApiService from './local-api.service';
import StorageService from './storage.service';
import {
  Firm,
  Product,
  Order,
  OrderStage,
  User,
  Address,
  Driver,
} from '../types';

class ApiService {
  // Get the appropriate service based on configuration
  private getService() {
    // Priority: Mock > Local Backend
    const useMock = shouldUseMockData();
    const useLocal = shouldUseLocalBackend();

    console.log('[ApiService] Routing decision:', { useMock, useLocal });

    if (useMock) {
      console.log('[ApiService] Using MockApiService');
      return MockApiService;
    }

    // Default to local backend
    console.log('[ApiService] Using LocalApiService');
    return LocalApiService;
  }

  // Authentication
  async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      return await this.getService().sendVerificationCode(phone);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send verification code');
    }
  }

  async verifyCode(phone: string, code: string): Promise<{ token: string; user: User; isNewUser: boolean }> {
    try {
      const result = await this.getService().verifyCode(phone, code);

      // Store auth token and user data
      await StorageService.setAuthToken(result.token);
      await StorageService.setUserData(result.user);

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Verification failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.getService().logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage on logout
      await StorageService.clearAll();
    }
  }

  // User Management
  async getUserProfile(): Promise<User> {
    try {
      const user = await this.getService().getUserProfile();
      await StorageService.setUserData(user);
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    try {
      const user = await this.getService().updateUserProfile(updates);
      await StorageService.setUserData(user);
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Address Management
  async getUserAddresses(): Promise<Address[]> {
    try {
      return await this.getService().getUserAddresses();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch addresses');
    }
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    try {
      return await this.getService().addAddress(address);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add address');
    }
  }

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address> {
    try {
      return await this.getService().updateAddress(addressId, updates);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update address');
    }
  }

  async deleteAddress(addressId: string): Promise<{ success: boolean }> {
    try {
      return await this.getService().deleteAddress(addressId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete address');
    }
  }

  // Firms
  async getFirms(): Promise<Firm[]> {
    try {
      return await this.getService().getFirms();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch vendors');
    }
  }

  async getFirmById(firmId: string): Promise<Firm> {
    try {
      return await this.getService().getFirmById(firmId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch vendor details');
    }
  }

  // Products
  async getProducts(firmId?: string): Promise<Product[]> {
    try {
      return await this.getService().getProducts(firmId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products');
    }
  }

  async getProductById(productId: string): Promise<Product> {
    try {
      return await this.getService().getProductById(productId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product details');
    }
  }

  // Orders
  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    firmId: string;
    addressId: string;
    total: number;
    preferredDeliveryTime?: string | null; // ISO string or null for "Now"
    paymentMethod?: 'cash' | 'card';
  }): Promise<Order> {
    try {
      return await this.getService().createOrder(orderData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create order');
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      return await this.getService().getOrders();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      return await this.getService().getOrderById(orderId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order details');
    }
  }

  async getOrderStatus(orderId: string): Promise<{
    stage: OrderStage;
    estimatedDelivery: Date;
    queuePosition?: number;
    ordersAhead?: number;
  }> {
    try {
      return await this.getService().getOrderStatus(orderId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order status');
    }
  }

  async getOrderDriver(orderId: string): Promise<Driver | null> {
    try {
      return await this.getService().getOrderDriver(orderId);
    } catch (error: any) {
      console.error('Failed to fetch driver info:', error);
      return null;
    }
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    try {
      return await this.getService().cancelOrder(orderId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  // Reviews
  async submitReview(orderId: string, rating: number, comment: string): Promise<{ success: boolean }> {
    try {
      return await this.getService().submitReview(orderId, rating, comment);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit review');
    }
  }

  // Location Services
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const result = await this.getService().reverseGeocode(lat, lng);
      return result.address;
    } catch (error: any) {
      console.error('Geocoding error:', error);
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  // Push Notifications
  async registerPushToken(token: string, platform: string): Promise<{ success: boolean }> {
    try {
      return await this.getService().registerPushToken(token, platform);
    } catch (error: any) {
      console.error('Failed to register push token:', error);
      return { success: false };
    }
  }

  async unregisterPushToken(token: string): Promise<{ success: boolean }> {
    try {
      return await this.getService().unregisterPushToken(token);
    } catch (error: any) {
      console.error('Failed to unregister push token:', error);
      return { success: false };
    }
  }

  // Helper method to check if using mock data
  isUsingMockData(): boolean {
    return shouldUseMockData();
  }
}

// Export singleton instance
export default new ApiService();

// Also export legacy function names for backward compatibility
export const sendVerificationCode = (phone: string) =>
  new ApiService().sendVerificationCode(phone);

export const verifyCode = (phone: string, code: string): Promise<{ token: string; user: User; isNewUser: boolean }> =>
  new ApiService().verifyCode(phone, code);

export const getUserData = () => new ApiService().getUserProfile();

export const updateUserProfile = (updates: Partial<User>) =>
  new ApiService().updateUserProfile(updates);

export const getUserAddresses = () => new ApiService().getUserAddresses();

export const addAddress = (address: Omit<Address, 'id'>) =>
  new ApiService().addAddress(address);

export const getFirms = () => new ApiService().getFirms();

export const getFirmById = (firmId: string) => new ApiService().getFirmById(firmId);

export const getProductsByFirm = (firmId: string) => new ApiService().getProducts(firmId);

export const getProductById = (productId: string) => new ApiService().getProductById(productId);

export const createOrder = (orderData: {
  items: Array<{ productId: string; quantity: number }>;
  firmId: string;
  addressId: string;
  total: number;
  preferredDeliveryTime?: string | null;
  paymentMethod?: 'cash' | 'card';
}) => new ApiService().createOrder(orderData);

export const getOrderById = (orderId: string) => new ApiService().getOrderById(orderId);

export const getOrderStatus = (orderId: string) => new ApiService().getOrderStatus(orderId);

export const getDriverInfo = (orderId: string) => new ApiService().getOrderDriver(orderId);

export const reverseGeocode = (lat: number, lng: number) =>
  new ApiService().reverseGeocode(lat, lng);

// Location is handled by expo-location, not API
export const getCurrentLocation = async (): Promise<{ lat: number; lng: number }> => {
  return {
    lat: 41.2995,
    lng: 69.2401,
  };
};
