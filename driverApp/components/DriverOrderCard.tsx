import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { OrderStage } from '../types';

type AddressType = 'Apartment' | 'House' | 'Office' | 'Private' | 'Government' | 'Custom';

interface DriverOrderCardProps {
  orderNumber: string;
  stage: OrderStage;
  customerName: string;
  customerPhone: string;
  addressType: AddressType;
  placeName?: string; // "Sofia Bakery", "Ministry of Finance", "Maslaxat 21", "IT Park"
  address: string;
  price: number;
  onPress?: () => void;
}

const STAGE_LABELS = {
  [OrderStage.ORDER_PLACED]: 'Order Placed',
  [OrderStage.IN_QUEUE]: 'IN QUEUE',
  [OrderStage.COURIER_ON_THE_WAY]: 'ON THE WAY',
  [OrderStage.COURIER_ARRIVED]: 'Arrived',
  [OrderStage.DELIVERED]: 'COMPLETED',
  [OrderStage.CANCELLED]: 'Cancelled',
};

const STAGE_COLORS = {
  [OrderStage.ORDER_PLACED]: '#3B82F6',
  [OrderStage.IN_QUEUE]: '#F97316',
  [OrderStage.COURIER_ON_THE_WAY]: '#3B82F6',
  [OrderStage.COURIER_ARRIVED]: '#8B5CF6',
  [OrderStage.DELIVERED]: '#10B981',
  [OrderStage.CANCELLED]: '#EF4444',
};

const ADDRESS_TYPE_CONFIG = {
  Apartment: { icon: '🏢', color: '#8B5CF6', label: 'Apartment' },
  House: { icon: '🏠', color: '#3B82F6', label: 'House' },
  Office: { icon: '👜', color: '#D4A574', label: 'Office' },
  Private: { icon: '🏪', color: '#EAB308', label: 'Private Business' },
  Government: { icon: '🏛️', color: '#10B981', label: 'Government' },
  Custom: { icon: '📍', color: '#6B7280', label: 'Custom' },
};

export const DriverOrderCard: React.FC<DriverOrderCardProps> = ({
  orderNumber,
  stage,
  customerName,
  customerPhone,
  addressType,
  placeName,
  address,
  price,
  onPress,
}) => {
  const stageColor = STAGE_COLORS[stage];
  const stageLabel = STAGE_LABELS[stage];
  const addressConfig = ADDRESS_TYPE_CONFIG[addressType];

  const handleCall = () => {
    if (customerPhone) {
      Linking.openURL(`tel:${customerPhone}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Top Row: Order ID + Address Type + Status */}
      <View style={styles.topRow}>
        <Text style={styles.orderNumber}>{orderNumber}</Text>
        <View style={styles.badgesRow}>
          <View style={[styles.addressTypeBadge, { backgroundColor: addressConfig.color + '15' }]}>
            <Text style={styles.addressTypeIcon}>{addressConfig.icon}</Text>
            <Text style={[styles.addressTypeText, { color: addressConfig.color }]}>
              {addressConfig.label}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: stageColor }]}>
            <Text style={styles.statusText}>{stageLabel}</Text>
          </View>
        </View>
      </View>

      {/* User Info Row with Call Button */}
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{customerName}</Text>
          <Text style={styles.userPhone}>{customerPhone}</Text>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCall}
          activeOpacity={0.7}
        >
          <Text style={styles.callIcon}>📞</Text>
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
      </View>

      {/* Address Section */}
      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.addressText}>{address}</Text>
        </View>

        {/* Place Name Badge (if provided) */}
        {placeName && (
          <View style={[styles.placeNameBadge, { backgroundColor: addressConfig.color + '10' }]}>
            <Text style={[styles.placeNameText, { color: addressConfig.color }]}>
              {addressConfig.icon} {placeName}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Row: Price */}
      <View style={styles.bottomRow}>
        <View style={styles.spacer} />
        <Text style={styles.price}>{price.toLocaleString()} UZS</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  // Top Row: Order ID + Badges
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  orderNumber: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F97316',
    letterSpacing: -0.4,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  addressTypeIcon: {
    fontSize: 14,
  },
  addressTypeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  // User Row
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 22,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C1633',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  userPhone: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    letterSpacing: -0.1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
  },
  callIcon: {
    fontSize: 15,
  },
  callText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.2,
  },

  // Address Section
  addressSection: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationPin: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 1,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  placeNameBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  placeNameText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // Bottom Row: Price
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
  },
  spacer: {
    flex: 1,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: -0.6,
  },
});
