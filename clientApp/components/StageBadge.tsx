import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStage } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';

interface StageBadgeProps {
  stage: OrderStage;
  showIcon?: boolean;
}

const STAGE_CONFIG = {
  [OrderStage.ORDER_PLACED]: {
    label: 'Order Placed',
    icon: '📝',
    color: Colors.primary,
  },
  [OrderStage.IN_QUEUE]: {
    label: 'In Queue',
    icon: '⏳',
    color: Colors.warning,
  },
  [OrderStage.COURIER_ON_THE_WAY]: {
    label: 'On the Way',
    icon: '🚗',
    color: Colors.primary,
  },
  [OrderStage.COURIER_ARRIVED]: {
    label: 'Courier Arrived',
    icon: '🚪',
    color: Colors.primary,
  },
  [OrderStage.DELIVERED]: {
    label: 'Delivered',
    icon: '✅',
    color: Colors.success,
  },
  [OrderStage.CANCELLED]: {
    label: 'Cancelled',
    icon: '❌',
    color: Colors.error,
  },
};

export const StageBadge: React.FC<StageBadgeProps> = ({ stage, showIcon = true }) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG[OrderStage.ORDER_PLACED];

  if (!config) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: config.color + '20' }]}>
      {showIcon && <Text style={styles.icon}>{config.icon}</Text>}
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: FontSizes.md,
    marginRight: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
