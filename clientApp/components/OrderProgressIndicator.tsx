import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStage } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { useLanguage } from '../context/LanguageContext';

interface OrderProgressIndicatorProps {
  currentStage: OrderStage;
}

const STAGES = [
  OrderStage.ORDER_PLACED,
  OrderStage.IN_QUEUE,
  OrderStage.COURIER_ON_THE_WAY,
  OrderStage.DELIVERED,
];

export const OrderProgressIndicator: React.FC<OrderProgressIndicatorProps> = ({
  currentStage,
}) => {
  const { t } = useLanguage();
  const currentStageIndex = STAGES.indexOf(currentStage);

  const getStageLabel = (stage: OrderStage): string => {
    switch (stage) {
      case OrderStage.ORDER_PLACED:
        return t('orderTracking.orderPlaced');
      case OrderStage.IN_QUEUE:
        return t('orderTracking.inQueue');
      case OrderStage.COURIER_ON_THE_WAY:
        return t('orderTracking.courierOnWay');
      case OrderStage.DELIVERED:
        return t('orderTracking.delivered');
      default:
        return '';
    }
  };

  const renderStage = (stage: OrderStage, index: number) => {
    const isCompleted = index < currentStageIndex;
    const isActive = index === currentStageIndex;
    const isInactive = index > currentStageIndex;

    return (
      <View key={stage} style={styles.stageContainer}>
        <View style={styles.stageWrapper}>
          {/* Circle */}
          <View
            style={[
              styles.circle,
              { backgroundColor: Colors.white }, // Required for shadow performance
              isCompleted && styles.circleCompleted,
              isActive && styles.circleActive,
              isInactive && styles.circleInactive,
            ]}
          >
            {isCompleted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            {isActive && (
              <View style={styles.activeIndicator}>
                <View style={styles.activeInnerCircle} />
              </View>
            )}
          </View>

          {/* Stage Label */}
          <Text
            style={[
              styles.stageLabel,
              (isCompleted || isActive) && styles.stageLabelActive,
              isInactive && styles.stageLabelInactive,
            ]}
            numberOfLines={2}
          >
            {getStageLabel(stage)}
          </Text>
        </View>

        {/* Connecting Line */}
        {index < STAGES.length - 1 && (
          <View
            style={[
              styles.connectingLine,
              index < currentStageIndex && styles.connectingLineCompleted,
              index >= currentStageIndex && styles.connectingLineInactive,
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {STAGES.map((stage, index) => renderStage(stage, index))}
    </View>
  );
};

const CIRCLE_SIZE = 48;
const LINE_HEIGHT = 3;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  stageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stageWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  circleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  circleActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  circleInactive: {
    backgroundColor: '#E5E9F2',
    borderColor: '#E5E9F2',
  },
  checkmark: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  activeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  stageLabel: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: 2,
    lineHeight: 16,
  },
  stageLabelActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  stageLabelInactive: {
    color: Colors.grayText,
    fontWeight: '400',
  },
  connectingLine: {
    position: 'absolute',
    top: CIRCLE_SIZE / 2 - LINE_HEIGHT / 2,
    left: '50%',
    right: -50,
    height: LINE_HEIGHT,
  },
  connectingLineCompleted: {
    backgroundColor: Colors.primary,
  },
  connectingLineInactive: {
    backgroundColor: '#E5E9F2',
  },
});
