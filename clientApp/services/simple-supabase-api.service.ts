/**
 * Simple Supabase API Service (MVP - No Edge Functions Required!)
 *
 * This service works directly with Supabase database without requiring edge functions.
 * Perfect for ultra-fast MVP launch!
 *
 * Edge functions can be added later when scaling.
 */

import { supabase } from '../config/supabase.config';
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

class SimpleSupabaseApiService {
  // ============================================
  // AUTHENTICATION (Simplified - No Edge Functions!)
  // ============================================

  async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate 4-digit verification code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification code in database (using service role permissions)
      const { error } = await supabase
        .from('verification_codes')
        .insert({
          phone,
          code,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (error) {
        console.error('[Auth] Database error:', error);
        // If insert fails due to RLS, that's okay for MVP - we'll handle it
      }

      // For MVP: Log the code to console (replace with Twilio later)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 VERIFICATION CODE (MVP MODE)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📞 Phone: ${phone}`);
      console.log(`🔑 Code: ${code}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Store code temporarily in AsyncStorage (for MVP)
      await StorageService.setItem(`verification_code_${phone}`, JSON.stringify({
        code,
        expiresAt: expiresAt.toISOString()
      }));

      return {
        success: true,
        message: 'Verification code sent successfully'
      };
    } catch (error: any) {
      console.error('[Auth] Send code error:', error);
      throw new Error('Failed to send verification code. Please try again.');
    }
  }

  async verifyCode(phone: string, code: string): Promise<{ token: string; user: User }> {
    try {
      // Get user data from storage (name and language set earlier in flow)
      const storedUser = await StorageService.getUser();
      const name = storedUser?.name || 'User';
      const language = storedUser?.language || 'en';

      // For MVP: Verify code from AsyncStorage
      const storedCodeData = await StorageService.getItem(`verification_code_${phone}`);

      if (!storedCodeData) {
        throw new Error('No verification code found. Please request a new code.');
      }

      const { code: expectedCode, expiresAt } = JSON.parse(storedCodeData);

      // Check if code expired
      if (new Date() > new Date(expiresAt)) {
        await StorageService.removeItem(`verification_code_${phone}`);
        throw new Error('Verification code expired. Please request a new code.');
      }

      // Verify code
      if (expectedCode !== code) {
        throw new Error('Invalid verification code');
      }

      // Clear used code
      await StorageService.removeItem(`verification_code_${phone}`);

      // Check if user exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone);

      let user: User;

      if (existingUsers && existingUsers.length > 0) {
        // Update existing user
        const existingUser = existingUsers[0];

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ name, language })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('[Auth] Update user error:', updateError);
          user = existingUser;
        } else {
          user = updatedUser;
        }
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            phone,
            name,
            language
          })
          .select()
          .single();

        if (createError) {
          console.error('[Auth] Create user error:', createError);
          throw new Error('Failed to create user. Please try again.');
        }

        user = newUser;
      }

      // Generate simple token (user ID based)
      const token = `watergo_token_${user.id}_${Date.now()}`;

      // Store token and user
      await StorageService.setToken(token);
      await StorageService.setUser({
        id: user.id,
        name: user.name,
        phone: user.phone,
        language: user.language
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          language: user.language
        }
      };
    } catch (error: any) {
      console.error('[Auth] Verify code error:', error);
      throw new Error(error.message || 'Invalid verification code');
    }
  }

  async logout(): Promise<{ success: boolean }> {
    await StorageService.clearAuth();
    return { success: true };
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async getUserProfile(): Promise<User> {
    try {
      const user = await StorageService.getUser();
      if (!user) throw new Error('User not found');

      // Fetch fresh data from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[User] Get profile error:', error);
        return user; // Return cached user on error
      }

      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        language: data.language
      };
    } catch (error: any) {
      console.error('[User] Get profile error:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    try {
      const user = await StorageService.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser: User = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        language: data.language
      };

      await StorageService.setUser(updatedUser);

      return updatedUser;
    } catch (error: any) {
      console.error('[User] Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  // ============================================
  // ADDRESS MANAGEMENT
  // ============================================

  async getUserAddresses(): Promise<Address[]> {
    try {
      const user = await StorageService.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Address] Get addresses error:', error);
        return [];
      }

      return (data || []).map(addr => ({
        id: addr.id,
        title: addr.title,
        address: addr.address,
        lat: addr.lat,
        lng: addr.lng,
        isDefault: addr.is_default
      }));
    } catch (error: any) {
      console.error('[Address] Get addresses error:', error);
      return [];
    }
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    try {
      const user = await StorageService.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          title: address.title,
          address: address.address,
          lat: address.lat,
          lng: address.lng,
          is_default: address.isDefault
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        isDefault: data.is_default
      };
    } catch (error: any) {
      console.error('[Address] Add address error:', error);
      throw new Error('Failed to add address');
    }
  }

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address> {
    try {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.lat !== undefined) dbUpdates.lat = updates.lat;
      if (updates.lng !== undefined) dbUpdates.lng = updates.lng;
      if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;

      const { data, error } = await supabase
        .from('addresses')
        .update(dbUpdates)
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        isDefault: data.is_default
      };
    } catch (error: any) {
      console.error('[Address] Update address error:', error);
      throw new Error('Failed to update address');
    }
  }

  async deleteAddress(addressId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('[Address] Delete address error:', error);
      throw new Error('Failed to delete address');
    }
  }

  // ============================================
  // FIRMS
  // ============================================

  async getFirms(): Promise<Firm[]> {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;

      return (data || []).map(firm => ({
        id: firm.id,
        name: firm.name,
        logo: firm.logo,
        rating: parseFloat(firm.rating),
        deliveryTime: firm.delivery_time,
        minOrder: parseFloat(firm.min_order),
        deliveryFee: parseFloat(firm.delivery_fee)
      }));
    } catch (error: any) {
      console.error('[Firms] Get firms error:', error);
      throw new Error('Failed to fetch firms');
    }
  }

  async getFirmById(firmId: string): Promise<Firm> {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .eq('id', firmId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        logo: data.logo,
        rating: parseFloat(data.rating),
        deliveryTime: data.delivery_time,
        minOrder: parseFloat(data.min_order),
        deliveryFee: parseFloat(data.delivery_fee)
      };
    } catch (error: any) {
      console.error('[Firms] Get firm error:', error);
      throw new Error('Firm not found');
    }
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(firmId?: string): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('in_stock', true);

      if (firmId) {
        query = query.eq('firm_id', firmId);
      }

      const { data, error } = await query.order('price', { ascending: true });

      if (error) throw error;

      return (data || []).map(product => ({
        id: product.id,
        firmId: product.firm_id,
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price),
        image: product.image,
        volume: product.volume,
        inStock: product.in_stock
      }));
    } catch (error: any) {
      console.error('[Products] Get products error:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async getProductById(productId: string): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        firmId: data.firm_id,
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        image: data.image,
        volume: data.volume,
        inStock: data.in_stock
      };
    } catch (error: any) {
      console.error('[Products] Get product error:', error);
      throw new Error('Product not found');
    }
  }

  // ============================================
  // ORDERS
  // ============================================

  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    firmId: string;
    addressId: string;
    total: number;
  }): Promise<Order> {
    try {
      const user = await StorageService.getUser();
      if (!user) throw new Error('User not found');

      // Calculate estimated delivery (30 min from now)
      const now = new Date();
      const estimatedDelivery = new Date(now.getTime() + 30 * 60 * 1000);

      // Create order
      const { data: orderData_result, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          firm_id: orderData.firmId,
          address_id: orderData.addressId,
          stage: 'ORDER_PLACED',
          total: orderData.total,
          estimated_delivery: estimatedDelivery.toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      await Promise.all(
        orderData.items.map(async (item) => {
          const product = await this.getProductById(item.productId);

          const { error: itemError } = await supabase
            .from('order_items')
            .insert({
              order_id: orderData_result.id,
              product_id: item.productId,
              quantity: item.quantity,
              price: product.price
            });

          if (itemError) throw itemError;

          return {
            product,
            quantity: item.quantity
          };
        })
      );

      // Fetch full order details
      const order = await this.getOrderById(orderData_result.id);

      return order;
    } catch (error: any) {
      console.error('[Orders] Create order error:', error);
      throw new Error('Failed to create order');
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const user = await StorageService.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          firm:firms(*),
          address:addresses(*),
          order_items(*, product:products(*)),
          driver:drivers(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapOrderData);
    } catch (error: any) {
      console.error('[Orders] Get orders error:', error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          firm:firms(*),
          address:addresses(*),
          order_items(*, product:products(*)),
          driver:drivers(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return this.mapOrderData(data);
    } catch (error: any) {
      console.error('[Orders] Get order error:', error);
      throw new Error('Order not found');
    }
  }

  async getOrderStatus(orderId: string): Promise<{ stage: OrderStage; estimatedDelivery: Date }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('stage, estimated_delivery')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return {
        stage: data.stage as OrderStage,
        estimatedDelivery: new Date(data.estimated_delivery)
      };
    } catch (error: any) {
      console.error('[Orders] Get order status error:', error);
      throw new Error('Failed to fetch order status');
    }
  }

  async getOrderDriver(orderId: string): Promise<Driver | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('driver:drivers(*)')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Type guard: data.driver could be an array or object depending on Supabase query
      if (!data || !data.driver) return null;

      const driverData = Array.isArray(data.driver) ? data.driver[0] : data.driver;
      if (!driverData) return null;

      return {
        id: driverData.id,
        name: driverData.name,
        phone: driverData.phone,
        photo: driverData.photo,
        rating: parseFloat(driverData.rating || '0'),
        vehicleNumber: driverData.vehicle_number || '',
        company: driverData.company || 'Unknown'
      };
    } catch (error: any) {
      console.error('[Orders] Get order driver error:', error);
      return null;
    }
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ stage: 'CANCELLED' })
        .eq('id', orderId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('[Orders] Cancel order error:', error);
      throw new Error('Failed to cancel order');
    }
  }

  // ============================================
  // REVIEWS
  // ============================================

  async submitReview(orderId: string, rating: number, comment: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          order_id: orderId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          rating,
          comment,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update order as reviewed
      await supabase
        .from('orders')
        .update({ reviewed: true })
        .eq('id', orderId);

      return { success: true };
    } catch (error: any) {
      console.error('[Reviews] Submit review error:', error);
      throw new Error('Failed to submit review');
    }
  }

  // ============================================
  // LOCATION SERVICES
  // ============================================

  async reverseGeocode(lat: number, lng: number): Promise<{ address: string }> {
    // For MVP, return a simple formatted address
    return {
      address: `Nukus, ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
  }

  // ============================================
  // PUSH NOTIFICATIONS
  // ============================================

  async registerPushToken(token: string, platform: string): Promise<{ success: boolean }> {
    // Supabase doesn't have push token support in this version
    console.log('[Supabase] Register push token:', token.substring(0, 20), platform);
    return { success: true };
  }

  async unregisterPushToken(token: string): Promise<{ success: boolean }> {
    console.log('[Supabase] Unregister push token:', token.substring(0, 20));
    return { success: true };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private mapOrderData(data: any): Order {
    return {
      id: data.id,
      orderNumber: data.order_number || `WG-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      stage: data.stage as OrderStage,
      items: (data.order_items || []).map((item: any) => ({
        product: {
          id: item.product.id,
          firmId: item.product.firm_id,
          name: item.product.name,
          description: item.product.description || '',
          price: parseFloat(item.product.price),
          image: item.product.image,
          volume: item.product.volume,
          inStock: item.product.in_stock
        },
        quantity: item.quantity
      })),
      subtotal: parseFloat(data.subtotal || data.total),
      deliveryFee: parseFloat(data.delivery_fee || 0),
      serviceFee: parseFloat(data.service_fee || 0),
      total: parseFloat(data.total),
      paymentMethod: (data.payment_method as 'cash' | 'card' | 'wallet') || 'cash',
      firm: {
        id: data.firm.id,
        name: data.firm.name,
        logo: data.firm.logo,
        rating: parseFloat(data.firm.rating),
        deliveryTime: data.firm.delivery_time,
        minOrder: parseFloat(data.firm.min_order),
        deliveryFee: parseFloat(data.firm.delivery_fee)
      },
      deliveryAddress: {
        id: data.address.id,
        title: data.address.title,
        address: data.address.address,
        lat: data.address.lat,
        lng: data.address.lng,
        isDefault: data.address.is_default
      },
      driver: data.driver ? {
        id: data.driver.id,
        name: data.driver.name,
        phone: data.driver.phone,
        photo: data.driver.photo,
        rating: parseFloat(data.driver.rating),
        vehicleNumber: data.driver.vehicle_number,
        company: data.driver.company || 'Unknown'
      } : null,
      createdAt: new Date(data.created_at),
      estimatedDelivery: new Date(data.estimated_delivery),
      preferredDeliveryTime: data.preferred_delivery_time ? new Date(data.preferred_delivery_time) : null
    };
  }
}

export default new SimpleSupabaseApiService();
