import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStage } from '../types';
import { Colors, Spacing, FontSizes } from '../config/colors';

interface StageBadgeProps {
  stage: OrderStage;
}

const STAGES = [
  {
    stage: OrderStage.ORDER_PLACED,
    label: 'Placed',
    icon: '📝',
  },
  {
    stage: OrderStage.IN_QUEUE,
    label: 'Queue',
    icon: '⏳',
  },
  {
    stage: OrderStage.COURIER_ON_THE_WAY,
    label: 'On Way',
    icon: '🚗',
  },
  {
    stage: OrderStage.COURIER_ARRIVED,
    label: 'Arrived',
    icon: '🚪',
  },
  {
    stage: OrderStage.DELIVERED,
    label: 'Delivered',
    icon: '✅',
  },
];

export const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  const currentStageIndex = STAGES.findIndex(s => s.stage === stage);
  const isCancelled = stage === OrderStage.CANCELLED;

  if (isCancelled) {
    return (
      <View style={styles.container}>
        <View style={styles.stageWrapper}>
          <View style={[styles.stageDot, { backgroundColor: Colors.error }]}>
            <Text style={styles.dotIcon}>❌</Text>
          </View>
          <Text style={[styles.stageLabel, { color: Colors.error }]}>Cancelled</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressLine}>
        {STAGES.map((stageItem, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isActive = isCompleted || isCurrent;

          return (
            <React.Fragment key={stageItem.stage}>
              {/* Stage Circle */}
              <View style={styles.stageWrapper}>
                <View
                  style={[
                    styles.stageDot,
                    isCompleted && styles.stageDotCompleted,
                    isCurrent && styles.stageDotCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Text style={styles.checkMark}>✓</Text>
                  ) : (
                    <Text style={styles.dotIcon}>{stageItem.icon}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stageLabel,
                    isActive && styles.stageLabelActive,
                  ]}
                >
                  {stageItem.label}
                </Text>
              </View>

              {/* Connecting Line */}
              {index < STAGES.length - 1 && (
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stageWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stageDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stageDotCompleted: {
    backgroundColor: Colors.success,
  },
  stageDotCurrent: {
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.primary + '40',
  },
  dotIcon: {
    fontSize: 20,
  },
  checkMark: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stageLabel: {
    fontSize: FontSizes.xs,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  stageLabelActive: {
    color: '#0C1633',
    fontWeight: '600',
  },
  line: {
    height: 3,
    backgroundColor: '#E5E7EB',
    flex: 1,
    marginTop: 24,
    marginHorizontal: -8,
  },
  lineCompleted: {
    backgroundColor: Colors.success,
  },
});
