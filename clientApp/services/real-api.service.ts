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
import { getFirmLogo, getProductImage } from '../utils/imageMapping';

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
    const firms = await HttpService.get<Firm[]>(API_ENDPOINTS.FIRMS.LIST);
    // Map to local asset images
    return firms.map(firm => ({
      ...firm,
      logo: getFirmLogo(firm.name) || firm.logo,
    }));
  }

  async getFirmById(firmId: string): Promise<Firm> {
    const url = API_ENDPOINTS.FIRMS.DETAIL.replace(':id', firmId);
    const firm = await HttpService.get<Firm>(url);
    // Map to local asset image
    return {
      ...firm,
      logo: getFirmLogo(firm.name) || firm.logo,
    };
  }

  // Products
  async getProducts(firmId?: string): Promise<Product[]> {
    const url = firmId
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?firmId=${firmId}`
      : API_ENDPOINTS.PRODUCTS.LIST;
    const products = await HttpService.get<Product[]>(url);
    // Map to local asset images based on firm and volume
    return products.map(product => ({
      ...product,
      image: getProductImage(this.getFirmNameFromProduct(product), product.volume) || product.image,
    }));
  }

  async getProductById(productId: string): Promise<Product> {
    const url = API_ENDPOINTS.PRODUCTS.DETAIL.replace(':id', productId);
    const product = await HttpService.get<Product>(url);
    // Map to local asset image
    return {
      ...product,
      image: getProductImage(this.getFirmNameFromProduct(product), product.volume) || product.image,
    };
  }

  // Helper to extract firm name from product name
  private getFirmNameFromProduct(product: Product): string {
    const name = product.name.toLowerCase();
    if (name.includes('aqua')) return 'aquawater';
    if (name.includes('ocean')) return 'oceanwater';
    if (name.includes('zam')) return 'zamzamwater';
    if (name.includes('crystal')) return 'crystalwater';
    return '';
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

  async getOrderStatus(orderId: string): Promise<{
    stage: OrderStage;
    estimatedDelivery: Date;
    queuePosition?: number;
    ordersAhead?: number;
  }> {
    const url = API_ENDPOINTS.ORDERS.STATUS.replace(':id', orderId);
    return await HttpService.get<{
      stage: OrderStage;
      estimatedDelivery: Date;
      queuePosition?: number;
      ordersAhead?: number;
    }>(url);
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
