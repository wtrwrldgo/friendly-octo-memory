// DEPRECATED: This file is a compatibility shim.
// New code should use stores/useCartStore.ts instead.

import React, { ReactNode, useEffect } from 'react';
import { useCartStore } from '../stores/useCartStore';
import { Cart, Product, Firm } from '../types';

// Re-export hook for backward compatibility
export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  // Transform cart items to match old Cart format
  const cart: Cart = {
    items: items.map((item) => ({
      product: {
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        image: item.product_image || '',
        firmId: item.firm_id,
      } as unknown as Product,
      quantity: item.quantity,
    })),
    total: getTotalPrice(),
    firm: items.length > 0 ? { id: items[0].firm_id, name: items[0].firm_name } as Firm : null,
  };

  // Backward-compatible methods
  const addToCart = (product: Product, firm: Firm) => {
    addItem({
      product_id: product.id,
      firm_id: firm.id,
      firm_name: firm.name,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image,
    });
  };

  const removeFromCart = (productId: string) => {
    const item = items.find((i) => i.product_id === productId);
    if (item) {
      removeItem(item.id);
    }
  };

  const incrementQuantity = (productId: string) => {
    const item = items.find((i) => i.product_id === productId);
    if (item) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  const decrementQuantity = (productId: string) => {
    const item = items.find((i) => i.product_id === productId);
    if (item) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find((i) => i.product_id === productId);
    return item ? item.quantity : 0;
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItemQuantity,
  };
};

// Empty provider for backward compatibility
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const loadCart = useCartStore((state) => state.loadCart);

  useEffect(() => {
    loadCart();
  }, []);

  return <>{children}</>;
};
