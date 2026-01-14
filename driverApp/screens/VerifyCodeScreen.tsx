import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius } from '../config/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import LocalApiService from '../services/local-api.service';
import { useToast } from '../context/ToastContext';
import { useDriverStore } from '../stores/useDriverStore';
import { useLanguageStore } from '../stores/useLanguageStore';

interface VerifyCodeScreenProps {
  navigation: any;
  route: any;
}

export default function VerifyCodeScreen({ navigation, route }: VerifyCodeScreenProps) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const setDriver = useDriverStore((state) => state.setDriver);
  const t = useLanguageStore((state) => state.t);

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      showError(t('verify.errors.enter6Digits'));
      return;
    }

    setLoading(true);
    try {
      // Verify OTP via backend
      const authResult = await LocalApiService.verifyCode(phone, code);

      if (!authResult.user) {
        throw new Error('No user data received');
      }

      // Verify driver role
      if (authResult.user.role !== 'driver') {
        await LocalApiService.logout();
        showError(t('verify.errors.driversOnly'));
        return;
      }

      // Fetch driver profile
      const driverProfile = await LocalApiService.getDriverProfile(authResult.user.id);

      if (!driverProfile) {
        await LocalApiService.logout();
        showError(t('verify.errors.noDriverProfile'));
        return;
      }

      // Set driver in context
      await setDriver(driverProfile);

      showSuccess(t('verify.welcome'));

      // Navigate to AskName if driver doesn't have a name, otherwise go to Main
      if (!driverProfile.name || driverProfile.name === 'Guest') {
        navigation.replace('AskName');
      } else {
        // Auth state change will handle navigation to Main
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      showError(error.message || t('verify.errors.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await LocalApiService.sendCode(phone);
      showSuccess(t('verify.codeResent'));
    } catch (error: any) {
      showError(error.message || t('verify.errors.resendFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>{t('verify.title')}</Text>
          <Text style={styles.subtitle}>
            {t('verify.sentCodeTo')}{'\n'}
            <Text style={styles.phone}>{phone}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
            placeholder="000000"
            placeholderTextColor={Colors.textLight}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            textAlign="center"
          />

          <PrimaryButton
            title={t('verify.verifyContinue')}
            onPress={handleVerifyCode}
            loading={loading}
            disabled={code.length !== 6}
            style={{ marginTop: Spacing.lg }}
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.changeButton}
          >
            <Text style={styles.changeText}>{t('verify.changePhone')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('verify.didntReceive')}</Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendText}>{t('verify.resendCode')}</Text>
          </TouchableOpacity>
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
    lineHeight: 22,
  },
  phone: {
    fontWeight: '600',
    color: Colors.primary,
  },
  form: {
    flex: 1,
  },
  input: {
    height: 70,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 12,
    textAlign: 'center',
    backgroundColor: Colors.white,
  },
  changeButton: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  changeText: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  resendText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
