import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../constants/Colors';

interface NoInternetScreenProps {
  onRetry?: () => void;
}

const NoInternetScreen: React.FC<NoInternetScreenProps> = ({ onRetry }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* 3D No WiFi Icon */}
        <Image
          source={require('../assets/ui-icons/no-internet-3d.png')}
          style={styles.icon}
          resizeMode="contain"
        />

        {/* Main Title */}
        <Text style={styles.title}>No Internet Connection</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Please check your network and try again.
        </Text>

        {/* Retry Button */}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  icon: {
    width: 180,
    height: 180,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grayText,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.3,
  },
});

export default NoInternetScreen;
