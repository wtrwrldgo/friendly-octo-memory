import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface WaterGoLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const WaterGoLogo: React.FC<WaterGoLogoProps> = ({ size = 'medium' }) => {
  const fontSize = size === 'small' ? 20 : size === 'large' ? 32 : 28;
  const iconSize = size === 'small' ? 18 : size === 'large' ? 28 : 24;

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { fontSize: iconSize }]}>💧</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.waterText, { fontSize }]}>Water</Text>
        <Text style={[styles.goText, { fontSize }]}>Go</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  textContainer: {
    flexDirection: 'row',
  },
  waterText: {
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  goText: {
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});
