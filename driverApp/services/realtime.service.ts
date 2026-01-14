/**
 * Real-time Service - Driver App
 * STUB: Real-time subscriptions are disabled - using polling instead
 * This file is kept for API compatibility but all methods are no-ops
 */

import { Order, OrderStage } from '../types';

type OrderCallback = (order: Order) => void;
type OrderUpdateCallback = (orderId: string, stage: OrderStage) => void;

class RealtimeService {
  /**
   * Subscribe to new orders - DISABLED (using polling)
   */
  subscribeToNewOrders(_driverDistrict?: string): void {
    console.log('[Realtime] Subscriptions disabled - using polling instead');
  }

  /**
   * Unsubscribe from order updates - DISABLED
   */
  unsubscribeFromOrders(): void {
    // No-op
  }

  /**
   * Register callback for new orders - DISABLED
   */
  onNewOrder(_callback: OrderCallback): () => void {
    return () => {}; // Return empty unsubscribe function
  }

  /**
   * Register callback for order updates - DISABLED
   */
  onOrderUpdate(_callback: OrderUpdateCallback): () => void {
    return () => {};
  }

  /**
   * Register callback for cancelled orders - DISABLED
   */
  onOrderCancelled(_callback: OrderCallback): () => void {
    return () => {};
  }

  /**
   * Subscribe to specific order updates - DISABLED (using polling)
   */
  subscribeToOrder(_orderId: string, _callback: (order: Order) => void): () => void {
    console.log('[Realtime] Order subscription disabled - using polling instead');
    return () => {};
  }

  /**
   * Get connection status - always false since disabled
   */
  isConnected(): boolean {
    return false;
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    // No-op
  }
}

export default new RealtimeService();
