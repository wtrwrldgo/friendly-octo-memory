import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Order } from '../types';

interface OrderContextType {
  currentOrder: Order | null;
  orderHistory: Order[];
  setCurrentOrder: (order: Order | null) => void;
  addToHistory: (order: Order) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  const addToHistory = (order: Order) => {
    setOrderHistory((prev) => [order, ...prev]);
  };

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        orderHistory,
        setCurrentOrder,
        addToHistory,
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
