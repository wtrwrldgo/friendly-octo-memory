/**
 * API Service - Driver App
 * Delegates all API calls to LocalApiService (Express.js backend)
 */

import { Order, OrderStage, Earnings } from '../types';
import LocalApiService from './local-api.service';

class ApiService {
  // ============================================
  // Orders
  // ============================================

  async getActiveOrders(driverId: string): Promise<Order[]> {
    return LocalApiService.getActiveOrders(driverId);
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return LocalApiService.getOrderById(orderId);
  }

  async acceptOrder(orderId: string, driverId: string): Promise<void> {
    return LocalApiService.acceptOrder(orderId, driverId);
  }

  async updateOrderStatus(orderId: string, stage: OrderStage): Promise<void> {
    return LocalApiService.updateOrderStatus(orderId, stage);
  }

  async getOrderHistory(driverId: string, limit = 50): Promise<Order[]> {
    return LocalApiService.getOrderHistory(driverId, limit);
  }

  // ============================================
  // Driver Profile
  // ============================================

  async getDriverProfile(driverId: string): Promise<any> {
    return LocalApiService.getDriverProfile(driverId);
  }

  async updateDriverOnlineStatus(driverId: string, isOnline: boolean): Promise<void> {
    return LocalApiService.updateDriverOnlineStatus(driverId, isOnline);
  }

  async updateDriverLocation(driverId: string, latitude: number, longitude: number): Promise<void> {
    return LocalApiService.updateDriverLocation(driverId, latitude, longitude);
  }

  // ============================================
  // Earnings
  // ============================================

  async getEarnings(driverId: string): Promise<Earnings> {
    return LocalApiService.getEarnings(driverId);
  }

  // ============================================
  // Authentication
  // ============================================

  async verifyDriverRole(userId: string): Promise<boolean> {
    return LocalApiService.verifyDriverRole(userId);
  }

  async updateDriverName(driverId: string, name: string): Promise<void> {
    return LocalApiService.updateDriverName(driverId, name);
  }

  async updateDriverDistrict(driverId: string, district: string): Promise<void> {
    return LocalApiService.updateDriverDistrict(driverId, district);
  }
}

export default new ApiService();
