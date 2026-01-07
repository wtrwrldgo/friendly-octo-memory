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

  async verifyCode(phone: string, code: string): Promise<{ token: string; user: User; isNewUser: boolean }> {
    const result = await HttpService.post<{ token: string; user: User; isNewUser?: boolean }>(API_ENDPOINTS.AUTH.VERIFY_CODE, { phone, code });
    return {
      token: result.token,
      user: result.user,
      isNewUser: result.isNewUser ?? false,
    };
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
    const firms: any[] = await HttpService.get<Firm[]>(API_ENDPOINTS.FIRMS.LIST);
    // Map snake_case to camelCase and local asset images
    return firms.map(firm => ({
      id: firm.id,
      name: firm.name,
      logo: getFirmLogo(firm.name) || firm.logoUrl || firm.logo_url || firm.logo || '',
      homeBanner: firm.homeBannerUrl || firm.home_banner_url,
      detailBanner: firm.detailBannerUrl || firm.detail_banner_url,
      rating: parseFloat(firm.rating) || 5.0,
      deliveryTime: firm.deliveryTime || firm.delivery_time || '30-45 min',
      minOrder: parseInt(firm.minOrder || firm.min_order) || 0,
      minOrderEnabled: firm.minOrderEnabled ?? firm.min_order_enabled ?? false,
      deliveryFee: parseInt(firm.deliveryFee || firm.delivery_fee) || 0,
      deliveryFeeEnabled: firm.deliveryFeeEnabled ?? firm.delivery_fee_enabled ?? false,
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
    const url = API_ENDPOINTS.FIRMS.DETAIL.replace(':id', firmId);
    const firm: any = await HttpService.get<Firm>(url);
    // Map snake_case to camelCase and local asset images
    return {
      id: firm.id,
      name: firm.name,
      logo: getFirmLogo(firm.name) || firm.logoUrl || firm.logo_url || firm.logo || '',
      homeBanner: firm.homeBannerUrl || firm.home_banner_url,
      detailBanner: firm.detailBannerUrl || firm.detail_banner_url,
      rating: parseFloat(firm.rating) || 5.0,
      deliveryTime: firm.deliveryTime || firm.delivery_time || '30-45 min',
      minOrder: parseInt(firm.minOrder || firm.min_order) || 0,
      minOrderEnabled: firm.minOrderEnabled ?? firm.min_order_enabled ?? false,
      deliveryFee: parseInt(firm.deliveryFee || firm.delivery_fee) || 0,
      deliveryFeeEnabled: firm.deliveryFeeEnabled ?? firm.delivery_fee_enabled ?? false,
      bottleDeposit: parseInt(firm.bottleDeposit || firm.bottle_deposit) || 5000,
      bottleDepositEnabled: firm.bottleDepositEnabled ?? firm.bottle_deposit_enabled ?? false,
      bottleDepositPrice: parseInt(firm.bottleDepositPrice || firm.bottle_deposit_price) || 15000,
      scheduleDaysLimit: parseInt(firm.scheduleDaysLimit || firm.schedule_days_limit) || 7,
      scheduleTimeInterval: parseInt(firm.scheduleTimeInterval || firm.schedule_time_interval) || 30,
      location: firm.city || firm.location || 'Nukus',
      phone: firm.phone,
    };
  }

  // Products
  async getProducts(firmId?: string): Promise<Product[]> {
    const url = firmId
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?firmId=${firmId}`
      : API_ENDPOINTS.PRODUCTS.LIST;
    const products: any[] = await HttpService.get<Product[]>(url);
    // Map to local asset images, parse price, and include translated names
    return products.map(product => ({
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: getProductImage(this.getFirmNameFromProduct(product), product.volume) || product.image,
      name_en: product.name_en,
      name_ru: product.name_ru,
      name_uz: product.name_uz,
      name_kaa: product.name_kaa,
    }));
  }

  async getProductById(productId: string): Promise<Product> {
    const url = API_ENDPOINTS.PRODUCTS.DETAIL.replace(':id', productId);
    const product: any = await HttpService.get<Product>(url);
    // Map to local asset image, parse price, and include translated names
    return {
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: getProductImage(this.getFirmNameFromProduct(product), product.volume) || product.image,
      name_en: product.name_en,
      name_ru: product.name_ru,
      name_uz: product.name_uz,
      name_kaa: product.name_kaa,
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
