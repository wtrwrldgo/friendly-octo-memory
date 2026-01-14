import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LicensePlateProps {
  plateNumber: string;
  size?: 'small' | 'medium' | 'large';
}

export const LicensePlate: React.FC<LicensePlateProps> = ({ plateNumber, size = 'medium' }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
          text: { fontSize: 11, letterSpacing: 1 },
        };
      case 'large':
        return {
          container: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
          text: { fontSize: 22, letterSpacing: 3 },
        };
      default: // medium
        return {
          container: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
          text: { fontSize: 18, letterSpacing: 2 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container]}>
      <Text style={[styles.plateText, sizeStyles.text]}>
        {plateNumber.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  plateText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
