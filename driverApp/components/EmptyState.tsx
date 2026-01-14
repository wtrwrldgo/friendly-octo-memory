import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { scale, moderateScale, wp } from '../constants/Responsive';

interface EmptyStateProps {
  icon?: string;
  image?: ImageSourcePropType;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, image, title, message }) => {
  return (
    <View style={styles.container}>
      {image ? (
        <Image
          source={image}
          style={styles.illustration}
          resizeMode="contain"
        />
      ) : icon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
    paddingBottom: scale(80),
  },
  illustration: {
    width: wp(75),
    height: wp(75),
    marginBottom: scale(32),
  },
  icon: {
    fontSize: moderateScale(80),
    marginBottom: scale(24),
    opacity: 0.3,
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: '#0C1633',
    marginBottom: scale(12),
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: moderateScale(16),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(26),
    fontWeight: '500',
    maxWidth: wp(85),
  },
});
