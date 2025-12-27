import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView,
  TextInput, Image, Pressable, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { verifyCode, sendVerificationCode } from '../services/api';
import { useUser } from '../context/UserContext';

type VerifyCodeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyCode'>;
  route: RouteProp<AuthStackParamList, 'VerifyCode'>;
};

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

const VerifyCodeScreen: React.FC<VerifyCodeScreenProps> = ({ navigation, route }) => {
  const phone = route.params?.phone ?? '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();
  const { user, setUser, loadAddressesFromAPI } = useUser();

  // Countdown timer
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  // Disable back navigation to prevent OTP confusion
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerBackVisible: false,
    });
  }, [navigation]);

  const filled = useMemo(() => code.length === CODE_LENGTH, [code]);

  const handleChange = (text: string) => {
    const digits = (text || '').replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
  };

  const handleContinue = async () => {
    if (!filled || loading) return;
    if (!phone) {
      showError(t('errors.invalidPhone') || 'Phone number is missing. Please go back and try again.');
      return;
    }

    try {
      setLoading(true);
      const result = await verifyCode(phone, code);

      // Set user data first
      const mergedUser = {
        ...result.user,
        name: result.user.name || user?.name || 'Guest',
        language: user?.language || result.user.language || 'en',
      };
      setUser(mergedUser);
      showSuccess(t('auth.verify') || 'Verified!');

      // Load addresses from API to check if returning user
      console.log('Loading addresses from API...');
      await loadAddressesFromAPI();

      // Check if this is a returning user (has addresses in the API response)
      // We need to fetch addresses again to get the count since state updates are async
      const ApiService = require('../services/api').default;
      let userAddresses: any[] = [];
      try {
        userAddresses = await ApiService.getUserAddresses();
        console.log('Fetched addresses for auth check:', userAddresses.length);
      } catch (err) {
        console.log('Could not fetch addresses:', err);
      }

      const hasProperName = mergedUser.name && mergedUser.name !== 'Guest' && mergedUser.name !== 'User';
      const hasAddresses = userAddresses && userAddresses.length > 0;

      console.log('🔐 [VerifyCode] hasProperName:', hasProperName, 'hasAddresses:', hasAddresses);

      if (hasProperName && hasAddresses) {
        // RETURNING USER: Has name and addresses
        // Don't navigate - App.tsx will automatically switch to MainNavigator
        console.log('🔐 [VerifyCode] Returning user detected - letting App.tsx handle navigation');
        // Just wait a moment for state to update, App.tsx will switch to Home
        return;
      } else if (!hasProperName) {
        // NEW USER: Needs to enter name first
        console.log('🔐 [VerifyCode] New user - navigating to AskName');
        navigation.navigate('AskName');
      } else {
        // User has name but no addresses - go to address selection
        console.log('🔐 [VerifyCode] User needs address - navigating to SelectAddress');
        navigation.navigate('SelectAddress', { isFirstAddress: true });
      }
    } catch (e: any) {
      // Check if error is related to invalid/incorrect code
      const errorMsg = e?.message?.toLowerCase() || '';
      const isInvalidCode = errorMsg.includes('invalid') ||
                           errorMsg.includes('incorrect') ||
                           errorMsg.includes('wrong') ||
                           errorMsg.includes('expired') ||
                           errorMsg.includes('code');

      if (isInvalidCode) {
        showError(t('errors.invalidCode') || 'Invalid code. Please try again.');
      } else {
        showError(t('errors.networkError') || 'Something went wrong. Please try again.');
      }
      setCode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    if (!phone) {
      showError(t('errors.invalidPhone') || 'Phone number is missing');
      return;
    }

    try {
      // Actually call the API to resend the code
      await sendVerificationCode(phone);
      setSeconds(RESEND_SECONDS);
      setCode(''); // Clear any entered code
      showSuccess(t('auth.resendCode') || 'Code resent');
    } catch (e: any) {
      showError(e?.message || t('errors.networkError') || 'Failed to resend code');
    }
  };

  const handleChangeNumber = () => {
    // Navigate back to phone input screen
    navigation.goBack();
  };

  const phonePretty = useMemo(() => {
    return phone.replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }, [phone]);

  return (
    <LinearGradient
      colors={['#E9F7FF', '#F7FEFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.innerContent}>
              <View style={styles.content}>
                {/* Water drop with envelope mascot */}
                <Image
                  source={require('../assets/illustrations/verify-phone.png')}
                  style={styles.hero}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />

                <Text style={styles.h1}>
                  {t('auth.enterCodeTitle') || 'Enter the code\nwe sent to'}
                </Text>
                <Text style={styles.phone}>{phonePretty || phone}</Text>

                {/* Code input boxes */}
                <Pressable onPress={() => inputRef.current?.focus()} style={{ width: '100%' }}>
                  <View style={styles.codeRow}>
                    {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                      const char = code[i] ?? '';
                      const isActive = i === code.length;
                      return (
                        <View key={i} style={[styles.codeBox, isActive && styles.codeBoxActive]}>
                          <Text style={styles.codeChar}>{char}</Text>
                        </View>
                      );
                    })}
                  </View>
                </Pressable>

                <TextInput
                  ref={inputRef}
                  value={code}
                  onChangeText={handleChange}
                  autoFocus
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={CODE_LENGTH}
                  importantForAutofill="yes"
                  style={styles.hiddenInput}
                />

                <View style={{ height: 14 }} />

                {/* Resend Code Button */}
                <Pressable disabled={seconds > 0} onPress={handleResend}>
                  <Text style={[styles.resendLine, seconds > 0 && { opacity: 0.4 }]}>
                    {seconds > 0
                      ? `${t('auth.resendIn') || 'Resend code in'} ${formatTimer(seconds)}`
                      : t('auth.resendCode') || 'Resend code'
                    }
                  </Text>
                </Pressable>

                {/* Change Number Link */}
                <Pressable onPress={handleChangeNumber}>
                  <Text style={styles.link}>
                    {t('auth.changeNumber') || 'Change number'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <PrimaryButton
                  title={t('auth.continue') || 'Continue'}
                  onPress={handleContinue}
                  disabled={!filled || loading}
                  loading={loading}
                  style={styles.button}
                  textStyle={styles.buttonText}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

function formatTimer(s: number) {
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

const BOX = 52;
const RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 20,
  },
  hero: {
    width: 160,
    height: 160,
    marginBottom: 8,
  },
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0C1633',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 6,
  },
  phone: {
    fontSize: 22,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 18,
  },
  codeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  codeBox: {
    width: BOX,
    height: BOX,
    borderRadius: RADIUS,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  codeBoxActive: {
    borderWidth: 2,
    borderColor: '#2F7BFF',
  },
  codeChar: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0C1633',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  resendLine: {
    fontSize: 18,
    color: '#2F7BFF',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  link: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 20,
    paddingTop: 6,
  },
  button: {
    height: 64,
    borderRadius: 22,
    backgroundColor: '#2F7BFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2F7BFF',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
});

export default VerifyCodeScreen;
