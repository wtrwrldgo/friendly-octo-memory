import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Cart, CartItem, Product, Firm } from '../types';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, firm: Firm) => void;
  removeFromCart: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    firm: null,
  });

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const addToCart = (product: Product, firm: Firm) => {
    setCart((prev) => {
      // If cart is empty or from same firm, add product
      if (!prev.firm || prev.firm.id === firm.id) {
        const existingItem = prev.items.find((item) => item.product.id === product.id);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = prev.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...prev.items, { product, quantity: 1 }];
        }

        return {
          items: newItems,
          total: calculateTotal(newItems),
          firm: firm,
        };
      }

      // If from different firm, replace cart
      return {
        items: [{ product, quantity: 1 }],
        total: product.price,
        firm: firm,
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.product.id !== productId);
      return {
        items: newItems,
        total: calculateTotal(newItems),
        firm: newItems.length > 0 ? prev.firm : null,
      };
    });
  };

  const incrementQuantity = (productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      return {
        ...prev,
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  };

  const decrementQuantity = (productId: string) => {
    setCart((prev) => {
      const existingItem = prev.items.find((item) => item.product.id === productId);
      if (!existingItem || existingItem.quantity <= 1) {
        return prev;
      }

      const newItems = prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );

      return {
        ...prev,
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      firm: null,
    });
  };

  const getItemQuantity = (productId: string): number => {
    const item = cart.items.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
