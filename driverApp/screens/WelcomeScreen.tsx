import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius } from '../config/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useLanguageStore } from '../stores/useLanguageStore';

interface WelcomeScreenProps {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const t = useLanguageStore((state) => state.t);

  const handleGetStarted = () => {
    navigation.navigate('AuthPhone');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🚚💨</Text>
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>
            {t('welcome.subtitle')}
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>{t('welcome.feature1')}</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureText}>{t('welcome.feature2')}</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>{t('welcome.feature3')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title={t('welcome.getStarted')}
          onPress={handleGetStarted}
        />
        <Text style={styles.footerText}>
          {t('welcome.terms')}
        </Text>
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
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  features: {
    marginTop: Spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    padding: Spacing.xl,
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
