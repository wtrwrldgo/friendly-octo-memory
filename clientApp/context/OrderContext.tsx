import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStage } from '../types';
import ApiService from '../services/api';

const CURRENT_ORDER_KEY = 'watergo_current_order';

interface OrderContextType {
  currentOrder: Order | null;
  orderHistory: Order[];
  setCurrentOrder: (order: Order | null) => void;
  addToHistory: (order: Order) => void;
  hasActiveOrder: boolean;
  clearActiveOrder: () => void;
  loadOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentOrder, setCurrentOrderState] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Load orders from API
  const loadOrders = async () => {
    try {
      const orders = await ApiService.getOrders();
      console.log('[OrderContext] Loaded orders from API:', orders.length);

      // Separate active and completed orders
      const activeOrders = orders.filter(
        (o) => o.stage !== OrderStage.DELIVERED && o.stage !== OrderStage.CANCELLED
      );
      const completedOrders = orders.filter(
        (o) => o.stage === OrderStage.DELIVERED || o.stage === OrderStage.CANCELLED
      );

      // Set current order (most recent active)
      if (activeOrders.length > 0) {
        setCurrentOrderState(activeOrders[0]);
        await AsyncStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(activeOrders[0]));
      }

      // Set order history (completed orders)
      setOrderHistory(completedOrders);
    } catch (error) {
      console.error('[OrderContext] Error loading orders from API:', error);
    }
  };

  // Load orders on mount
  useEffect(() => {
    const initialize = async () => {
      // First try to restore from storage for instant UI
      try {
        const storedOrder = await AsyncStorage.getItem(CURRENT_ORDER_KEY);
        if (storedOrder) {
          const order = JSON.parse(storedOrder);
          if (order.stage !== OrderStage.DELIVERED && order.stage !== OrderStage.CANCELLED) {
            setCurrentOrderState(order);
            console.log('[OrderContext] Restored order from storage:', order.id);
          } else {
            await AsyncStorage.removeItem(CURRENT_ORDER_KEY);
          }
        }
      } catch (error) {
        console.error('[OrderContext] Error loading from storage:', error);
      }

      // Then load fresh data from API
      await loadOrders();
    };
    initialize();
  }, []);

  // Wrapper to persist order to storage
  const setCurrentOrder = async (order: Order | null) => {
    setCurrentOrderState(order);
    try {
      if (order) {
        await AsyncStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(order));
      } else {
        await AsyncStorage.removeItem(CURRENT_ORDER_KEY);
      }
    } catch (error) {
      console.error('[OrderContext] Error saving order to storage:', error);
    }
  };

  // Check if there's an active order (not delivered)
  const hasActiveOrder = useMemo(() => {
    if (!currentOrder) return false;
    return currentOrder.stage !== OrderStage.DELIVERED;
  }, [currentOrder]);

  const addToHistory = (order: Order) => {
    setOrderHistory((prev) => [order, ...prev]);
  };

  const clearActiveOrder = async () => {
    await setCurrentOrder(null);
  };

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        orderHistory,
        setCurrentOrder,
        addToHistory,
        hasActiveOrder,
        clearActiveOrder,
        loadOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
