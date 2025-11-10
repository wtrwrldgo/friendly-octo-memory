import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { CartItemCard } from '../components/CartItemCard';
import { InfoRow } from '../components/InfoRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useOrder } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { createOrder } from '../services/api';

const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { cart, clearCart, incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const { selectedAddress, addresses } = useUser();
  const { setCurrentOrder, addToHistory } = useOrder();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Log selectedAddress whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('=== CartScreen Focused ===');
      console.log('Selected Address:', selectedAddress);
      console.log('All Addresses:', addresses);
      console.log('========================');
    }, [selectedAddress, addresses])
  );

  const handleCheckout = async () => {
    console.log('Checkout clicked - selectedAddress:', selectedAddress);
    console.log('All addresses:', addresses);

    if (!selectedAddress) {
      Alert.alert(t('cart.noAddress'), t('cart.selectAddressMessage'));
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
      Alert.alert(t('common.error'), error.message || t('cart.orderError'));
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderBar title={t('cart.title')} onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>{t('cart.empty')}</Text>
        </View>
      </View>
    );
  }

  const deliveryFee = cart.firm?.deliveryFee || 0;
  const total = cart.total + deliveryFee;

  return (
    <View style={styles.container}>
      <HeaderBar
        title={cart.firm?.name || t('cart.title')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart Items */}
        {cart.items.map((item) => (
          <CartItemCard
            key={item.product.id}
            item={item}
            onIncrement={() => incrementQuantity(item.product.id)}
            onDecrement={() => {
              if (item.quantity === 1) {
                removeFromCart(item.product.id);
              } else {
                decrementQuantity(item.product.id);
              }
            }}
            onRemove={() => removeFromCart(item.product.id)}
          />
        ))}

        {/* Delivery Info */}
        <InfoRow
          icon="🚚"
          label={`${t('cart.deliveryBy')} ${cart.firm?.name || t('cart.provider')}`}
          value={deliveryFee === 0 ? t('cart.free') : `${deliveryFee.toLocaleString()} UZS`}
          valueColor={deliveryFee === 0 ? Colors.success : Colors.text}
        />

        {/* Service Fee */}
        <InfoRow
          icon="💲"
          label={t('cart.serviceFee')}
          value={t('cart.free')}
          valueColor={Colors.success}
        />

        {/* Payment Method */}
        <InfoRow
          icon="💵"
          label={t('cart.payment')}
          subtitle={t('cart.cashOnly')}
          showArrow={true}
          onPress={() => navigation.navigate('PaymentMethod')}
        />

        {/* Address */}
        <InfoRow
          icon="📍"
          label={t('cart.address')}
          subtitle={selectedAddress?.address || t('cart.selectAddress')}
          showArrow={true}
          onPress={() => navigation.navigate('SelectAddress')}
        />

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Total and Place Order Button */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('cart.total')}</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} UZS</Text>
        </View>
        <PrimaryButton
          title={t('cart.placeOrder')}
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
    backgroundColor: Colors.white,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
});

export default CartScreen;
