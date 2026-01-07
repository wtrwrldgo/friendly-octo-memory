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
import SmsService from './sms.service';

// Simulate network delay
const delay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Store verification codes temporarily (in production, use secure backend storage)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Store dynamically added addresses (simulates database)
// Initialize with MOCK_ADDRESSES
let userAddresses: Address[] = [...MOCK_ADDRESSES];

// Store order stages and timestamps for progressive status updates
const orderStages = new Map<string, { stage: OrderStage; createdAt: number }>();

class MockApiService {
  // Authentication
  async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
    await delay(500);

    // Generate a random 4-digit code
    const code = SmsService.generateVerificationCode();

    // Store the code with 10-minute expiration
    verificationCodes.set(phone, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send SMS via CRM (Eskiz)
    const smsResult = await SmsService.sendVerificationCode(phone, code);

    if (!smsResult.success) {
      // SMS not sent - development mode
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 DEVELOPMENT MODE - SMS NOT SENT');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📞 Phone: ${phone}`);
      console.log(`🔑 Verification Code: ${code}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ℹ️  Enter this code to continue testing');
      console.log('ℹ️  Deploy Supabase Edge Function for real SMS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return {
        success: true,
        message: 'Verification code sent successfully (dev mode)',
      };
    }

    console.log(`✅ SMS sent successfully to ${phone}`);
    return {
      success: true,
      message: 'Verification code sent successfully',
    };
  }

  async verifyCode(phone: string, code: string): Promise<{ token: string; user: User; isNewUser: boolean }> {
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

    // Return user with ID and phone, but don't overwrite name/language
    // The app will merge this with existing user data (name entered in AskNameScreen)
    const user: User = {
      id: `user_${Date.now()}`,
      phone,
    };

    // Mock always returns new user (in real app, backend determines this)
    return {
      token: `mock_token_${Date.now()}`,
      user,
      isNewUser: true,
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
    console.log('Mock API - getUserAddresses called, returning:', userAddresses);
    return userAddresses;
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    await delay(1000);
    const newAddress = {
      ...address,
      id: `address_${Date.now()}`,
    };
    userAddresses.push(newAddress);
    console.log('Mock API - Address added:', newAddress);
    console.log('Mock API - Total addresses:', userAddresses.length);
    return newAddress;
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

  async deleteAddress(_addressId: string): Promise<{ success: boolean }> {
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
    paymentMethod?: string;
    preferredDeliveryTime?: string | null;
  }): Promise<Order> {
    await delay(1500);

    console.log('Mock API - createOrder called with addressId:', orderData.addressId);

    const firm = await this.getFirmById(orderData.firmId);
    const addresses = await this.getUserAddresses();

    console.log('Mock API - Available addresses:', addresses);

    const address = addresses.find((a) => a.id === orderData.addressId);

    if (!address) {
      console.error('Mock API - Address not found! Looking for ID:', orderData.addressId);
      console.error('Mock API - Available address IDs:', addresses.map(a => a.id));

      // For development: Create a temporary address if not found
      // This allows the app to work even if address sync fails
      const tempAddress: Address = {
        id: orderData.addressId,
        title: 'Selected Address',
        address: 'User selected address from map',
        lat: 41.2995,
        lng: 69.2401,
        isDefault: false,
      };
      console.log('Mock API - Using temporary address:', tempAddress);

      // Continue with temp address instead of throwing error
      // In real API, this would be properly validated
      return this.createOrderWithAddress(orderData, firm, tempAddress);
    }

    return this.createOrderWithAddress(orderData, firm, address);
  }

  // Helper method to create order with address
  private async createOrderWithAddress(
    orderData: {
      items: Array<{ productId: string; quantity: number }>;
      firmId: string;
      addressId: string;
      total: number;
      paymentMethod?: string;
      preferredDeliveryTime?: string | null;
    },
    firm: Firm,
    address: Address
  ): Promise<Order> {
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

    // Calculate fees
    const subtotal = orderData.total;
    const deliveryFee = firm.deliveryFee;
    const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
    const total = subtotal + deliveryFee + serviceFee;

    const orderId = `order_${Date.now()}`;
    const seq = Math.floor(Math.random() * 1000) + 1;
    const orderNumber = `WG-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;
    const order: Order = {
      id: orderId,
      orderNumber,
      stage: OrderStage.ORDER_PLACED,
      items,
      subtotal,
      deliveryFee,
      serviceFee,
      total,
      paymentMethod: (orderData.paymentMethod as 'cash' | 'card' | 'wallet') || 'cash',
      firm,
      deliveryAddress: address,
      driver: null,
      createdAt: now,
      estimatedDelivery,
      preferredDeliveryTime: orderData.preferredDeliveryTime ? new Date(orderData.preferredDeliveryTime) : null,
      queuePosition: undefined,
      ordersAhead: undefined,
    };

    // Initialize order stage tracking for progressive updates
    orderStages.set(orderId, {
      stage: OrderStage.ORDER_PLACED,
      createdAt: Date.now(),
    });

    console.log('Mock API - Order created successfully:', order.id);
    return order;
  }

  async getOrders(): Promise<Order[]> {
    await delay(800);
    // Return empty array for now - in real app, would return user's order history
    return [];
  }

  async getOrderById(_orderId: string): Promise<Order> {
    await delay(800);
    throw new Error('Order not found');
  }

  async getOrderStatus(orderId: string): Promise<{
    stage: OrderStage;
    estimatedDelivery: Date;
    queuePosition?: number;
    ordersAhead?: number;
  }> {
    await delay(500);

    // Get or initialize order stage tracking
    let orderInfo = orderStages.get(orderId);
    if (!orderInfo) {
      // If order not tracked, initialize it
      orderInfo = {
        stage: OrderStage.ORDER_PLACED,
        createdAt: Date.now(),
      };
      orderStages.set(orderId, orderInfo);
    }

    // Calculate time elapsed since order creation (in seconds)
    const timeElapsed = (Date.now() - orderInfo.createdAt) / 1000;

    // Progress through stages based on time
    let currentStage = orderInfo.stage;

    if (timeElapsed < 10) {
      // 0-10 seconds: ORDER_PLACED
      currentStage = OrderStage.ORDER_PLACED;
    } else if (timeElapsed < 25) {
      // 10-25 seconds: IN_QUEUE
      currentStage = OrderStage.IN_QUEUE;
    } else if (timeElapsed < 40) {
      // 25-40 seconds: COURIER_ON_THE_WAY
      currentStage = OrderStage.COURIER_ON_THE_WAY;
    } else if (timeElapsed < 55) {
      // 40-55 seconds: COURIER_ARRIVED
      currentStage = OrderStage.COURIER_ARRIVED;
    } else {
      // 55+ seconds: DELIVERED
      currentStage = OrderStage.DELIVERED;
    }

    // Update stored stage
    orderInfo.stage = currentStage;
    orderStages.set(orderId, orderInfo);

    const result: {
      stage: OrderStage;
      estimatedDelivery: Date;
      queuePosition?: number;
      ordersAhead?: number;
    } = {
      stage: currentStage,
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000),
    };

    // Add queue information when order is in queue
    if (currentStage === OrderStage.IN_QUEUE) {
      result.queuePosition = 3;
      result.ordersAhead = 2;
    }

    return result;
  }

  async getOrderDriver(_orderId: string): Promise<Driver | null> {
    await delay(500);
    // Return driver after order is in COURIER_ON_THE_WAY stage
    return MOCK_DRIVER;
  }

  async cancelOrder(_orderId: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  }

  // Reviews
  async submitReview(orderId: string, rating: number, comment: string): Promise<{ success: boolean }> {
    await delay(800);
    console.log('Review submitted:', { orderId, rating, comment });
    // In mock mode, just return success
    return { success: true };
  }

  // Location Services
  async reverseGeocode(lat: number, lng: number): Promise<{ address: string }> {
    await delay(800);
    return {
      address: `Street Address at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }

  // Push Notifications (mock - just logs)
  async registerPushToken(token: string, platform: string): Promise<{ success: boolean }> {
    console.log('[Mock] Register push token:', token.substring(0, 20), platform);
    return { success: true };
  }

  async unregisterPushToken(token: string): Promise<{ success: boolean }> {
    console.log('[Mock] Unregister push token:', token.substring(0, 20));
    return { success: true };
  }
}

export default new MockApiService();
