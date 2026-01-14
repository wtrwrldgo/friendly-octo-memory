import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { OrderStage } from '../types';

interface OrderItem {
  name: string;
  quantity: number;
}

interface OrderDetailCardProps {
  customerName: string;
  customerPhone: string;
  address: string;
  placeName?: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryFee: number;
  serviceFee: number;
  stage: OrderStage;
  onStartDelivery?: () => void;
  onNavigate?: () => void;
  onComplete?: () => void;
  onCall?: () => void;
}

export const OrderDetailCard: React.FC<OrderDetailCardProps> = ({
  customerName,
  customerPhone,
  address,
  placeName,
  items,
  totalPrice,
  deliveryFee,
  serviceFee,
  stage,
  onStartDelivery,
  onNavigate,
  onComplete,
  onCall,
}) => {
  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      Linking.openURL(`tel:${customerPhone}`);
    }
  };

  const itemsPrice = totalPrice - deliveryFee - serviceFee;

  const getActionButton = () => {
    switch (stage) {
      case OrderStage.IN_QUEUE:
      case OrderStage.ORDER_PLACED:
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onStartDelivery}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start Delivery</Text>
          </TouchableOpacity>
        );
      case OrderStage.COURIER_ON_THE_WAY:
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { flex: 1 }]}
              onPress={onNavigate}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonIcon}>🧭</Text>
              <Text style={styles.secondaryButtonText}>Navigate</Text>
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1 }]}
              onPress={onComplete}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Mark Arrived</Text>
            </TouchableOpacity>
          </View>
        );
      case OrderStage.COURIER_ARRIVED:
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Complete Delivery</Text>
          </TouchableOpacity>
        );
      case OrderStage.DELIVERED:
        return (
          <View style={styles.completedBadge}>
            <Text style={styles.completedIcon}>✓</Text>
            <Text style={styles.completedText}>Delivery Completed</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Customer Section */}
      <View style={styles.section}>
        <View style={styles.customerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.customerPhone}>{customerPhone}</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Address Section - PROMINENT */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DELIVERY ADDRESS</Text>
        <View style={styles.addressCard}>
          <Text style={styles.locationPin}>📍</Text>
          <View style={styles.addressContent}>
            <Text style={styles.addressText}>{address}</Text>
            {placeName && (
              <View style={styles.placeNameBadge}>
                <Text style={styles.placeNameText}>{placeName}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ORDER ITEMS</Text>
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemIcon}>💧</Text>
              <Text style={styles.itemText}>
                {item.quantity}× {item.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Price Breakdown - SUBTLE */}
      <View style={styles.section}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Items</Text>
          <Text style={styles.priceValue}>{itemsPrice.toLocaleString()} UZS</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.feeLabel}>Delivery fee</Text>
          <Text style={styles.feeValue}>{deliveryFee.toLocaleString()} UZS</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.feeLabel}>Service fee</Text>
          <Text style={styles.feeValue}>{serviceFee.toLocaleString()} UZS</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{totalPrice.toLocaleString()} UZS</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>{getActionButton()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },

  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Customer Section
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarIcon: {
    fontSize: 24,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  customerPhone: {
    fontSize: 15,
    fontWeight: '400',
    color: '#64748B',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 20,
  },

  // Address Section - PROMINENT
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationPin: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C1633',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  placeNameBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 8,
  },
  placeNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
    letterSpacing: 0.1,
  },

  // Items Section
  itemsContainer: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0C1633',
    letterSpacing: -0.1,
  },

  // Price Section - SUBTLE
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0C1633',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C1633',
  },
  feeLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#94A3B8',
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C1633',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: -0.4,
  },

  // Action Section
  actionSection: {
    padding: 20,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonIcon: {
    fontSize: 18,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0C1633',
    letterSpacing: 0.2,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  completedIcon: {
    fontSize: 20,
    color: '#10B981',
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 0.2,
  },
});
