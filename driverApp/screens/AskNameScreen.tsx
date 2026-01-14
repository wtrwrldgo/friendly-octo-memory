import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes } from '../config/colors';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../context/ToastContext';
import { useDriverStore } from '../stores/useDriverStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useAuthStore } from '../stores/useAuthStore';

interface AskNameScreenProps {
  navigation: any;
}

export default function AskNameScreen(_props: AskNameScreenProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const updateDriverName = useDriverStore((state) => state.updateDriverName);
  const setSession = useAuthStore((state) => state.setSession);
  const t = useLanguageStore((state) => state.t);

  const handleContinue = async () => {
    if (name.trim().length < 2) {
      showError(t('askName.errors.enterName'));
      return;
    }

    setLoading(true);
    try {
      // In dev mode, skip the actual update to avoid RLS errors
      if (__DEV__) {
        console.log('[DEV] Skipping name update:', name.trim());
        showSuccess(t('askName.profileUpdated'));

        // Create a fake session to trigger navigation to Main
        const fakeSession = {
          user: {
            id: 'd1111111-1111-1111-1111-111111111111',
            email: 'dev@driver.com',
            role: 'driver',
          },
          access_token: 'dev-token',
        };
        setSession(fakeSession);
      } else {
        await updateDriverName(name.trim());
        showSuccess(t('askName.profileUpdated'));
        // Navigation will be handled by auth state change
      }
    } catch (error: any) {
      console.error('Error updating name:', error);
      showError(error.message || t('askName.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.title}>{t('askName.title')}</Text>
          <Text style={styles.subtitle}>
            {t('askName.subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextField
            label={t('askName.label')}
            value={name}
            onChangeText={setName}
            placeholder={t('askName.placeholder')}
            autoFocus
            autoCapitalize="words"
          />

          <PrimaryButton
            title={t('askName.continue')}
            onPress={handleContinue}
            loading={loading}
            disabled={name.trim().length < 2}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </KeyboardAvoidingView>
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
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
});
