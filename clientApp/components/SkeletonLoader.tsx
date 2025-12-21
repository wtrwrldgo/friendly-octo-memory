import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Colors } from '../constants/Colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const FirmCardSkeleton: React.FC = () => {
  return (
    <View style={styles.firmCard}>
      {/* Banner */}
      <SkeletonLoader width="100%" height={160} borderRadius={16} />

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <SkeletonLoader width={32} height={32} borderRadius={8} />
          <SkeletonLoader width={50} height={14} style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.metaItem}>
          <SkeletonLoader width={32} height={32} borderRadius={8} />
          <SkeletonLoader width={60} height={14} style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.metaItem}>
          <SkeletonLoader width={32} height={32} borderRadius={8} />
          <SkeletonLoader width={40} height={14} style={{ marginLeft: 8 }} />
        </View>
      </View>

      {/* Chips row */}
      <View style={styles.chipsRow}>
        <SkeletonLoader width={80} height={28} borderRadius={12} />
        <SkeletonLoader width={100} height={28} borderRadius={12} />
      </View>

      {/* CTA button */}
      <SkeletonLoader width="100%" height={44} borderRadius={14} style={{ marginTop: 14 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
  firmCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
});
