import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
type DriverCardProps = {
  name: string;
  plateNumber: string;
  carBrand?: string;
  carColor?: string;
  onCallPress?: (e: GestureResponderEvent) => void;
};

// Map color names to hex values
const getCarColorHex = (colorName: string): string => {
  const colors: Record<string, string> = {
    // Common car colors
    white: '#64748B',
    black: '#1E293B',
    blue: '#2563EB',
    red: '#DC2626',
    green: '#16A34A',
    yellow: '#EAB308',
    orange: '#EA580C',
    gray: '#6B7280',
    grey: '#6B7280',
    silver: '#9CA3AF',
    brown: '#92400E',
    beige: '#A3A380',
    gold: '#CA8A04',
    purple: '#9333EA',
    pink: '#EC4899',
  };
  return colors[colorName.toLowerCase()] || '#64748B';
};

export const DriverCard: React.FC<DriverCardProps> = ({
  name,
  plateNumber,
  carBrand,
  carColor,
  onCallPress,
}) => {
  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image
          source={require('../assets/driver-avatar.png')}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      </View>

      {/* Name + car info */}
      <View style={styles.infoBlock}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        {/* Car info - color • brand */}
        {(carBrand || carColor) && (
          <View style={styles.carInfoRow}>
            {carColor && (
              <Text style={[styles.carColor, { color: getCarColorHex(carColor) }]}>
                {carColor}
              </Text>
            )}
            {carColor && carBrand && <Text style={styles.carDot}>•</Text>}
            {carBrand && <Text style={styles.carBrand}>{carBrand}</Text>}
          </View>
        )}

        {/* Plate number - separate row */}
        {plateNumber && (
          <View style={styles.plateRow}>
            <View style={styles.plateWrapper}>
              <Text style={styles.plateText}>{plateNumber}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Call button */}
      <TouchableOpacity
        style={styles.callButton}
        onPress={onCallPress}
        activeOpacity={0.8}
      >
        <Image
          source={require('../assets/call-icon.png')}
          style={styles.callIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: '#E9F2FF',
    shadowColor: '#1E40AF',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginHorizontal: 16,
    marginTop: 12,
  },

  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#D1E4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  infoBlock: {
    flex: 1,
    justifyContent: 'center',
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  firm: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748B',
  },

  carInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  plateRow: {
    flexDirection: 'row',
    marginTop: 6,
  },

  carBrand: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },

  carDot: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 4,
  },

  carColor: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },

  plateWrapper: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },

  plateText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },

  callButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  callIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
});
