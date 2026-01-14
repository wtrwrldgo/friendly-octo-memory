import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes } from '../config/colors';
import { PhoneInput } from '../components/PhoneInput';
import { PrimaryButton } from '../components/PrimaryButton';
import LocalApiService from '../services/local-api.service';
import { useToast } from '../context/ToastContext';
import { useLanguageStore } from '../stores/useLanguageStore';

interface AuthPhoneScreenProps {
  navigation: any;
}

export default function AuthPhoneScreen({ navigation }: AuthPhoneScreenProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const t = useLanguageStore((state) => state.t);

  // Development bypass - skip OTP for testing
  const handleDevBypass = () => {
    showSuccess(t('authPhone.devBypassed'));
    navigation.navigate('VerifyCode', { phone: '+998901234567' });
  };

  const handleSendCode = async () => {
    // Remove spaces and validate
    const cleanPhone = phone.replace(/\s/g, '');

    if (cleanPhone.length !== 9) { // Uzbekistan phone numbers are 9 digits
      showError(t('authPhone.errors.invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+998${cleanPhone}`;

      await LocalApiService.sendCode(fullPhone);

      showSuccess(t('authPhone.codeSent'));
      navigation.navigate('VerifyCode', { phone: fullPhone });
    } catch (error: any) {
      console.error('Error sending code:', error);
      showError(error.message || t('authPhone.errors.sendFailed'));
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
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>{t('authPhone.title')}</Text>
          <Text style={styles.subtitle}>
            {t('authPhone.subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <PhoneInput
            value={phone}
            onChangeText={setPhone}
          />

          <PrimaryButton
            title={t('authPhone.sendCode')}
            onPress={handleSendCode}
            loading={loading}
            disabled={phone.replace(/\s/g, '').length !== 9}
            style={{ marginTop: Spacing.lg }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('authPhone.footer')}
          </Text>

          {/* Development Bypass Button */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={handleDevBypass}
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>
                {t('authPhone.devSkipOtp')}
              </Text>
            </TouchableOpacity>
          )}
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
  footer: {
    paddingTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },
  devButton: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.warning,
    borderRadius: 8,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '600',
  },
});
