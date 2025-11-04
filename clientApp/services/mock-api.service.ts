/**
 * Mock API Service
 *
 * Simulates backend API calls with mock data.
 * Used for development and testing before backend is ready.
 */

import {
  Firm,
  Product,
  Order,
  OrderStage,
  User,
  Address,
  Driver,
} from '../types';
import {
  MOCK_FIRMS,
  MOCK_PRODUCTS,
  MOCK_ADDRESSES,
  MOCK_DRIVER,
} from '../constants/MockData';
import TwilioService from './twilio.service';

// Simulate network delay
const delay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Store verification codes temporarily (in production, use secure backend storage)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

class MockApiService {
  // Authentication
  async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
    await delay(500);

    // Generate a random 4-digit code
    const code = TwilioService.generateVerificationCode();

    // Store the code with 10-minute expiration
    verificationCodes.set(phone, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send SMS via Twilio
    const smsResult = await TwilioService.sendVerificationCode(phone, code);

    if (!smsResult.success) {
      // If Twilio fails, still log the code for development
      console.log(`[MOCK] Twilio failed, using code anyway: ${code}`);
      console.log(`[MOCK] Verification code for ${phone}: ${code}`);
      return {
        success: true,
        message: 'Verification code sent successfully (dev mode)',
      };
    }

    console.log(`[TWILIO] SMS sent successfully to ${phone}`);
    return {
      success: true,
      message: 'Verification code sent successfully',
    };
  }

  async verifyCode(phone: string, code: string): Promise<{ token: string; user: User }> {
    await delay(1000);

    // Check if code exists and is valid
    const storedCode = verificationCodes.get(phone);

    if (!storedCode) {
      throw new Error('No verification code found. Please request a new code.');
    }

    if (Date.now() > storedCode.expiresAt) {
      verificationCodes.delete(phone);
      throw new Error('Verification code expired. Please request a new code.');
    }

    if (storedCode.code !== code) {
      throw new Error('Invalid verification code');
    }

    // Clear the used code
    verificationCodes.delete(phone);

    const user: User = {
      id: `user_${Date.now()}`,
      name: 'Test User',
      phone,
      language: 'en',
    };

    return {
      token: `mock_token_${Date.now()}`,
      user,
    };
  }

  async logout(): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  }

  // User Management
  async getUserProfile(): Promise<User> {
    await delay(800);
    return {
      id: 'user_123',
      name: 'Test User',
      phone: '+998901234567',
      language: 'en',
    };
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    await delay(500);
    const currentUser = await this.getUserProfile();
    return {
      ...currentUser,
      ...updates,
    };
  }

  // Address Management
  async getUserAddresses(): Promise<Address[]> {
    await delay(800);
    return MOCK_ADDRESSES;
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    await delay(1000);
    return {
      ...address,
      id: `address_${Date.now()}`,
    };
  }

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address> {
    await delay(500);
    const addresses = await this.getUserAddresses();
    const address = addresses.find((a) => a.id === addressId);
    if (!address) {
      throw new Error('Address not found');
    }
    return {
      ...address,
      ...updates,
    };
  }

  async deleteAddress(addressId: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  }

  // Firms
  async getFirms(): Promise<Firm[]> {
    await delay(1200);
    return MOCK_FIRMS;
  }

  async getFirmById(firmId: string): Promise<Firm> {
    await delay(500);
    const firm = MOCK_FIRMS.find((f) => f.id === firmId);
    if (!firm) {
      throw new Error('Firm not found');
    }
    return firm;
  }

  // Products
  async getProducts(firmId?: string): Promise<Product[]> {
    await delay(800);
    if (firmId) {
      return MOCK_PRODUCTS.filter((p) => p.firmId === firmId);
    }
    return MOCK_PRODUCTS;
  }

  async getProductById(productId: string): Promise<Product> {
    await delay(500);
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // Orders
  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    firmId: string;
    addressId: string;
    total: number;
  }): Promise<Order> {
    await delay(1500);

    const firm = await this.getFirmById(orderData.firmId);
    const addresses = await this.getUserAddresses();
    const address = addresses.find((a) => a.id === orderData.addressId);

    if (!address) {
      throw new Error('Address not found');
    }

    // Map product IDs to full product objects
    const items = await Promise.all(
      orderData.items.map(async (item) => {
        const product = await this.getProductById(item.productId);
        return {
          product,
          quantity: item.quantity,
        };
      })
    );

    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 30 * 60 * 1000); // 30 min

    return {
      id: `order_${Date.now()}`,
      stage: OrderStage.ORDER_PLACED,
      items,
      total: orderData.total,
      firm,
      deliveryAddress: address,
      driver: null,
      createdAt: now,
      estimatedDelivery,
    };
  }

  async getOrders(): Promise<Order[]> {
    await delay(800);
    // Return empty array for now - in real app, would return user's order history
    return [];
  }

  async getOrderById(orderId: string): Promise<Order> {
    await delay(800);
    throw new Error('Order not found');
  }

  async getOrderStatus(orderId: string): Promise<{ stage: OrderStage; estimatedDelivery: Date }> {
    await delay(500);
    // Mock order status progression
    const stages = [
      OrderStage.ORDER_PLACED,
      OrderStage.IN_QUEUE,
      OrderStage.COURIER_ON_THE_WAY,
      OrderStage.DELIVERED,
    ];
    return {
      stage: stages[Math.floor(Math.random() * stages.length)],
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async getOrderDriver(orderId: string): Promise<Driver | null> {
    await delay(500);
    // Return driver after order is in COURIER_ON_THE_WAY stage
    return MOCK_DRIVER;
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  }

  // Location Services
  async reverseGeocode(lat: number, lng: number): Promise<{ address: string }> {
    await delay(800);
    return {
      address: `Street Address at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
}

export default new MockApiService();
