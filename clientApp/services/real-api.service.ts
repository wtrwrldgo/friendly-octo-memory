/**
 * Real API Service
 *
 * Connects to the actual backend API.
 * Implements all API calls using the HTTP service.
 */

import HttpService from './http.service';
import { API_ENDPOINTS } from '../config/api.config';
import {
  Firm,
  Product,
  Order,
  OrderStage,
  User,
  Address,
  Driver,
} from '../types';

class RealApiService {
  // Authentication
  async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
    return await HttpService.post(API_ENDPOINTS.AUTH.SEND_CODE, { phone });
  }

  async verifyCode(phone: string, code: string): Promise<{ token: string; user: User }> {
    return await HttpService.post(API_ENDPOINTS.AUTH.VERIFY_CODE, { phone, code });
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return await HttpService.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  }

  async logout(): Promise<{ success: boolean }> {
    return await HttpService.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  // User Management
  async getUserProfile(): Promise<User> {
    return await HttpService.get<User>(API_ENDPOINTS.USER.PROFILE);
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    return await HttpService.put<User>(API_ENDPOINTS.USER.UPDATE_PROFILE, updates);
  }

  // Address Management
  async getUserAddresses(): Promise<Address[]> {
    return await HttpService.get<Address[]>(API_ENDPOINTS.USER.ADDRESSES);
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    return await HttpService.post<Address>(API_ENDPOINTS.USER.ADD_ADDRESS, address);
  }

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address> {
    const url = API_ENDPOINTS.USER.UPDATE_ADDRESS.replace(':id', addressId);
    return await HttpService.put<Address>(url, updates);
  }

  async deleteAddress(addressId: string): Promise<{ success: boolean }> {
    const url = API_ENDPOINTS.USER.DELETE_ADDRESS.replace(':id', addressId);
    return await HttpService.delete<{ success: boolean }>(url);
  }

  // Firms
  async getFirms(): Promise<Firm[]> {
    return await HttpService.get<Firm[]>(API_ENDPOINTS.FIRMS.LIST);
  }

  async getFirmById(firmId: string): Promise<Firm> {
    const url = API_ENDPOINTS.FIRMS.DETAIL.replace(':id', firmId);
    return await HttpService.get<Firm>(url);
  }

  // Products
  async getProducts(firmId?: string): Promise<Product[]> {
    const url = firmId
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?firmId=${firmId}`
      : API_ENDPOINTS.PRODUCTS.LIST;
    return await HttpService.get<Product[]>(url);
  }

  async getProductById(productId: string): Promise<Product> {
    const url = API_ENDPOINTS.PRODUCTS.DETAIL.replace(':id', productId);
    return await HttpService.get<Product>(url);
  }

  // Orders
  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    firmId: string;
    addressId: string;
    total: number;
  }): Promise<Order> {
    return await HttpService.post<Order>(API_ENDPOINTS.ORDERS.CREATE, orderData);
  }

  async getOrders(): Promise<Order[]> {
    return await HttpService.get<Order[]>(API_ENDPOINTS.ORDERS.LIST);
  }

  async getOrderById(orderId: string): Promise<Order> {
    const url = API_ENDPOINTS.ORDERS.DETAIL.replace(':id', orderId);
    return await HttpService.get<Order>(url);
  }

  async getOrderStatus(orderId: string): Promise<{ stage: OrderStage; estimatedDelivery: Date }> {
    const url = API_ENDPOINTS.ORDERS.STATUS.replace(':id', orderId);
    return await HttpService.get<{ stage: OrderStage; estimatedDelivery: Date }>(url);
  }

  async getOrderDriver(orderId: string): Promise<Driver | null> {
    const url = API_ENDPOINTS.ORDERS.DRIVER.replace(':id', orderId);
    return await HttpService.get<Driver | null>(url);
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    const url = API_ENDPOINTS.ORDERS.CANCEL.replace(':id', orderId);
    return await HttpService.post<{ success: boolean }>(url);
  }

  // Location Services
  async reverseGeocode(lat: number, lng: number): Promise<{ address: string }> {
    return await HttpService.post<{ address: string }>(
      API_ENDPOINTS.LOCATION.REVERSE_GEOCODE,
      { lat, lng }
    );
  }
}

export default new RealApiService();
