import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStage } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../config/colors';
import { useLanguageStore } from '../stores/useLanguageStore';

interface StatusBadgeProps {
  stage: OrderStage;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ stage }) => {
  const t = useLanguageStore((state) => state.t);

  const getStageInfo = () => {
    switch (stage) {
      case OrderStage.ORDER_PLACED:
        return { label: t('orderStatus.orderPlaced'), color: Colors.info };
      case OrderStage.IN_QUEUE:
        return { label: t('orderStatus.inQueue'), color: Colors.warning };
      case OrderStage.COURIER_ON_THE_WAY:
        return { label: t('orderStatus.onTheWay'), color: Colors.primary };
      case OrderStage.DELIVERED:
        return { label: t('orderStatus.delivered'), color: Colors.success };
      case OrderStage.CANCELLED:
        return { label: t('orderStatus.cancelled'), color: Colors.error };
      default:
        return { label: stage, color: Colors.textLight };
    }
  };

  const { label, color } = getStageInfo();

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
