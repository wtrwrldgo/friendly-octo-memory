import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { OrderStage } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { StageBadge } from '../components/StageBadge';
import { DriverInfoCard } from '../components/DriverInfoCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useOrder } from '../context/OrderContext';
import { getDriverInfo, getOrderStatus } from '../services/api';

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentOrder, setCurrentOrder } = useOrder();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate order status updates
    const interval = setInterval(async () => {
      if (currentOrder && currentOrder.stage !== OrderStage.DELIVERED) {
        try {
          const status = await getOrderStatus(currentOrder.id);
          const driver = await getDriverInfo(currentOrder.id);
          setCurrentOrder({
            ...currentOrder,
            stage: status.stage,
            estimatedDelivery: status.estimatedDelivery,
            driver: driver || currentOrder.driver,
          });
        } catch (error) {
          console.error('Failed to update order status');
        }
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [currentOrder]);

  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <HeaderBar title="Order Tracking" onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active order</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar title="Order Tracking" onBack={() => navigation.navigate('MainTabs')} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Status */}
        <View style={styles.section}>
          <StageBadge stage={currentOrder.stage} />
          <Text style={styles.orderId}>Order #{currentOrder.id}</Text>
          <Text style={styles.estimatedTime}>
            Estimated delivery: {currentOrder.estimatedDelivery.toLocaleTimeString()}
          </Text>
        </View>

        {/* Driver Info */}
        {currentOrder.driver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Driver</Text>
            <DriverInfoCard driver={currentOrder.driver} />
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressTitle}>{currentOrder.deliveryAddress.title}</Text>
            <Text style={styles.addressText}>{currentOrder.deliveryAddress.address}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {currentOrder.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.product.name}
              </Text>
              <Text style={styles.itemPrice}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${currentOrder.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {currentOrder.stage === OrderStage.DELIVERED && (
        <View style={styles.footer}>
          <PrimaryButton
            title="Back to Home"
            onPress={() => {
              setCurrentOrder(null);
              navigation.navigate('MainTabs');
            }}
          />
        </View>
      )}
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
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.grayText,
  },
  content: {
    padding: Spacing.md,
  },
  section: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  orderId: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  estimatedTime: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  addressCard: {
    padding: Spacing.md,
    backgroundColor: Colors.gray,
    borderRadius: 8,
  },
  addressTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemName: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  itemPrice: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
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
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
});

export default OrderTrackingScreen;
