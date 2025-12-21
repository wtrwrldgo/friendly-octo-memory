import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, CartItem, Product, Firm } from '../types';

const CART_STORAGE_KEY = '@watergo_cart';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, firm: Firm) => void;
  removeFromCart: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  // Active order blocking
  activeOrderPopupVisible: boolean;
  showActiveOrderPopup: () => void;
  hideActiveOrderPopup: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    firm: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeOrderPopupVisible, setActiveOrderPopupVisible] = useState(false);

  const showActiveOrderPopup = () => setActiveOrderPopupVisible(true);
  const hideActiveOrderPopup = () => setActiveOrderPopupVisible(false);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Persist cart to storage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveCart(cart);
    }
  }, [cart, isLoaded]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveCart = async (cartData: Cart) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  };

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

      // If item doesn't exist, return unchanged
      if (!existingItem) {
        return prev;
      }

      // If quantity is 1, remove the item completely
      if (existingItem.quantity <= 1) {
        const newItems = prev.items.filter((item) => item.product.id !== productId);
        return {
          items: newItems,
          total: calculateTotal(newItems),
          firm: newItems.length > 0 ? prev.firm : null,
        };
      }

      // Otherwise, just decrement the quantity
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
        activeOrderPopupVisible,
        showActiveOrderPopup,
        hideActiveOrderPopup,
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
