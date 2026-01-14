import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderType } from '../types';

interface OrderTypeBadgeProps {
  type?: OrderType;
}

export const OrderTypeBadge: React.FC<OrderTypeBadgeProps> = ({ type }) => {
  if (!type) return null;

  const getTypeConfig = () => {
    switch (type) {
      case OrderType.GOVERNMENT:
        return {
          icon: '🏛️',
          label: 'Government',
          bgColor: '#E3F2FD',
          textColor: '#1976D2',
        };
      case OrderType.APARTMENT:
        return {
          icon: '🏢',
          label: 'Apartment',
          bgColor: '#F3E5F5',
          textColor: '#7B1FA2',
        };
      case OrderType.HOUSE:
        return {
          icon: '🏠',
          label: 'House',
          bgColor: '#E8F5E9',
          textColor: '#388E3C',
        };
      case OrderType.OFFICE:
        return {
          icon: '💼',
          label: 'Office',
          bgColor: '#FFF3E0',
          textColor: '#F57C00',
        };
      default:
        return null;
    }
  };

  const config = getTypeConfig();
  if (!config) return null;

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
