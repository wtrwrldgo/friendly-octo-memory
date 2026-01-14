import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes } from '../config/colors';
import { useAuthStore } from '../stores/useAuthStore';

export default function LoginScreenBypass() {
  const setSession = useAuthStore((state) => state.setSession);

  const handleBypassLogin = () => {
    // Create a fake session to bypass authentication
    const fakeSession = {
      user: {
        id: 'demo-driver-id',
        email: 'demo@driver.com',
        role: 'driver',
      },
      access_token: 'demo-token',
    };

    // Set the session to trigger navigation
    setSession(fakeSession);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🚚</Text>
          <Text style={styles.title}>WaterGo Driver</Text>
          <Text style={styles.subtitle}>Development Mode</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>⚠️ Bypass Mode Active</Text>
          <Text style={styles.infoText}>
            Authentication is temporarily disabled for development.{'\n\n'}
            This allows you to test the app immediately without setting up Supabase authentication.{'\n\n'}
            Real login will be enabled before production.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bypassButton}
          onPress={handleBypassLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.bypassButtonText}>Enter App (Bypass Login)</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>WaterGo Driver App v1.0</Text>
          <Text style={styles.footerSubtext}>Development Build</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 100,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl + 8,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    borderWidth: 2,
    borderColor: '#FFC107',
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  infoTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#856404',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: '#856404',
    lineHeight: 20,
  },
  bypassButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bypassButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
});
