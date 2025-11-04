import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Driver } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';

interface DriverInfoCardProps {
  driver: Driver;
}

export const DriverInfoCard: React.FC<DriverInfoCardProps> = ({ driver }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${driver.phone}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        <Text style={styles.photo}>{driver.photo}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{driver.name}</Text>
        <View style={styles.row}>
          <Text style={styles.rating}>⭐ {driver.rating}</Text>
          <View style={styles.dot} />
          <Text style={styles.vehicle}>{driver.vehicleNumber}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.callButton} onPress={handleCall}>
        <Text style={styles.callIcon}>📞</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  photoContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  photo: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
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
  vehicle: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 24,
  },
});
