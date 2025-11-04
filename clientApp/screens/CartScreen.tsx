import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { ProductCard } from '../components/ProductCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useOrder } from '../context/OrderContext';
import { createOrder } from '../services/api';

const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { cart, clearCart, incrementQuantity, decrementQuantity, removeFromCart, getItemQuantity } = useCart();
  const { selectedAddress } = useUser();
  const { setCurrentOrder, addToHistory } = useOrder();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert('No Address', 'Please select a delivery address');
      return;
    }

    if (!cart.firm) return;

    setLoading(true);
    try {
      // Transform cart items to API format
      const orderItems = cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const order = await createOrder({
        items: orderItems,
        firmId: cart.firm.id,
        addressId: selectedAddress.id,
        total: cart.total + (cart.firm?.deliveryFee || 0),
      });

      setCurrentOrder(order);
      addToHistory(order);
      clearCart();
      navigation.navigate('OrderTracking', { orderId: order.id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderBar title="Cart" onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar title="Cart" onBack={() => navigation.goBack()} />

      <FlatList
        data={cart.items}
        renderItem={({ item }) => (
          <ProductCard
            product={item.product}
            onAdd={() => {}}
            quantity={getItemQuantity(item.product.id)}
            onIncrement={() => incrementQuantity(item.product.id)}
            onDecrement={() => {
              if (item.quantity === 1) {
                removeFromCart(item.product.id);
              } else {
                decrementQuantity(item.product.id);
              }
            }}
          />
        )}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cart.total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${cart.firm?.deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ${(cart.total + (cart.firm?.deliveryFee || 0)).toFixed(2)}
          </Text>
        </View>
        <PrimaryButton
          title="Place Order"
          onPress={handleCheckout}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.grayText,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 300,
  },
  summary: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
  },
  summaryValue: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
});

export default CartScreen;
