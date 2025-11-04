import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Firm } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';

interface FirmCardProps {
  firm: Firm;
  onPress: () => void;
}

export const FirmCard: React.FC<FirmCardProps> = ({ firm, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: firm.logo }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{firm.name}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>⭐</Text>
            <Text style={styles.infoText}>{firm.rating}</Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.infoText}>{firm.deliveryTime}</Text>
          <View style={styles.dot} />
          <Text style={styles.infoText}>Min ${firm.minOrder}</Text>
        </View>
        <Text style={styles.deliveryFee}>
          Delivery fee: ${firm.deliveryFee}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: FontSizes.sm,
    marginRight: 2,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.grayText,
    marginHorizontal: Spacing.xs,
  },
  deliveryFee: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
});
