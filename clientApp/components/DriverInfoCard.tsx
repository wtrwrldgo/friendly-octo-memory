import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
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
      <View style={styles.leftSection}>
        {/* Driver Photo/Icon */}
        <View style={styles.photoContainer}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.carIcon}
            resizeMode="contain"
          />
        </View>

        {/* Driver Info */}
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.companyName}>{driver.company}</Text>
        </View>
      </View>

      {/* Vehicle Number Badge */}
      <View style={styles.vehicleBadge}>
        <Text style={styles.vehicleText}>{driver.vehicleNumber}</Text>
      </View>

      {/* Call Button */}
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
    alignItems: 'center',
    gap: Spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  carIcon: {
    width: 40,
    height: 40,
    tintColor: Colors.primary,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  companyName: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    fontWeight: '400',
  },
  vehicleBadge: {
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  vehicleText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  callButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary, // Required for efficient shadow rendering
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  callIcon: {
    fontSize: 24,
  },
});
