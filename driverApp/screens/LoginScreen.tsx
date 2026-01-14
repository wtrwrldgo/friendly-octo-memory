import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '../context/ToastContext';
import { useDriverStore } from '../stores/useDriverStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useAuthStore } from '../stores/useAuthStore';
import ENV_CONFIG from '../config/environment';

// Design constants
const BG_COLOR = '#F0F7FF';
const TEXT_DARK = '#1E293B';
const BRAND_BLUE = '#3B82F6';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { showError, showSuccess } = useToast();
  const setDriver = useDriverStore((state) => state.setDriver);
  const setTokens = useAuthStore((state) => state.setTokens);
  const t = useLanguageStore((state) => state.t);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Keyboard visibility listener
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSendCode = async () => {
    if (phone.length !== 9) {
      showError(t('login.errors.enterPhone'));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+998${phone}`;
      const apiUrl = `${ENV_CONFIG.apiUrl}/auth/mobile/send-code`;
      console.log('[Login] Sending code to:', fullPhone, 'API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, role: 'driver' }),
      });

      const data = await response.json();
      console.log('[Login] Response:', response.status, data);

      if (!response.ok || !data.success) {
        // Error message can be in data.message or data.error.message
        const errorMessage = data.error?.message || data.message || 'Failed to send code';
        throw new Error(errorMessage);
      }

      setCodeSent(true);
      showSuccess(t('login.codeSent'));
    } catch (error: any) {
      console.log('[Login] Error:', error.message);
      // Show user-friendly error for network issues
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        showError('Cannot connect to server. Please check your connection.');
      } else {
        showError(error.message || t('login.errors.sendCodeFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      showError(t('login.errors.enter6Digits'));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+998${phone}`;

      const response = await fetch(`${ENV_CONFIG.apiUrl}/auth/mobile/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          code,
          role: 'driver',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Error message can be in data.message or data.error.message
        const errorMessage = data.error?.message || data.message || 'Invalid code';
        throw new Error(errorMessage);
      }

      const { accessToken, refreshToken: newRefreshToken, user } = data.data;
      await setTokens(accessToken, newRefreshToken);

      const driverProfile = {
        id: user?.id || 'd1111111-1111-1111-1111-111111111111',
        name: user?.name || 'Driver',
        phone: user?.phone || fullPhone,
        photo_url: null,
        rating: user?.rating || 5.0,
        driver_number: user?.driver_number || null,
        vehicle_number: user?.vehicle_number || '',
        vehicle_model: user?.car_brand ? `${user.car_brand}` : '',
        vehicle_brand: user?.car_brand || '',
        vehicle_color: user?.car_color || '',
        is_available: user?.is_available || false,
        is_active: false,
        current_latitude: null,
        current_longitude: null,
        role: 'driver',
        district: user?.district || '',
        firm_id: user?.firm_id || null,
        firm_name: user?.firm_name || '',
        firm_logo_url: user?.firm_logo_url || null,
        driver_license_photo: null,
        driver_id_photo: null,
        vehicle_documents_photo: null,
      };

      await setDriver(driverProfile);
      showSuccess(t('login.loginSuccess'));
      navigation.replace('Main');
    } catch (error: any) {
      showError(error.message || t('login.errors.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    setCodeSent(false);
    setCode('');
  };

  const isPhoneValid = phone.length === 9;
  const isCodeValid = code.length === 6;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.container, keyboardVisible && styles.containerKeyboardOpen]}>
          {/* 3D Mascot - Hide when keyboard is open */}
          {!keyboardVisible && (
            <Animated.View
              style={[
                styles.mascotWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <Image
                source={require('../assets/watergo-driver-mascot.png')}
                style={styles.mascot}
                resizeMode="contain"
              />
            </Animated.View>
          )}

          {/* Logo - Always show */}
          <Animated.View
            style={[
              styles.logoBlock,
              keyboardVisible && styles.logoBlockSmall,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={[styles.logoText, keyboardVisible && styles.logoTextSmall]}>
              Water<Text style={styles.logoAccent}>Go</Text>
            </Text>
            <Text style={[styles.logoSubtitle, keyboardVisible && styles.logoSubtitleSmall]}>Driver</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {!codeSent ? (
              <>
                <Text style={styles.cardTitle}>Welcome Back! 👋</Text>
                <Text style={styles.cardSubtitle}>
                  Enter your phone number to get started
                </Text>

                <View style={[styles.phoneRow, inputFocused && styles.phoneRowFocused]}>
                  <View style={styles.countryBox}>
                    <Text style={styles.countryCode}>+998</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(text) => setPhone(text.replace(/\D/g, ''))}
                    maxLength={9}
                    placeholder="901234567"
                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSendCode}
                  disabled={!isPhoneValid || loading}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={
                      !isPhoneValid || loading
                        ? ['#CBD5E1', '#94A3B8']
                        : ['#3B82F6', '#2563EB']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={[
                      styles.buttonText,
                      (!isPhoneValid || loading) && styles.buttonTextDisabled
                    ]}>
                      {loading ? 'Sending...' : 'Send Verification Code'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Verification 🔐</Text>
                <Text style={styles.cardSubtitle}>
                  Enter the 6-digit code sent to
                </Text>
                <Text style={styles.phoneDisplay}>+998 {phone}</Text>

                <TextInput
                  style={[styles.codeInput, inputFocused && styles.codeInputFocused]}
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="• • • • • •"
                  placeholderTextColor="rgba(0, 0, 0, 0.25)"
                  autoFocus
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleVerifyCode}
                  disabled={!isCodeValid || loading}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={
                      !isCodeValid || loading
                        ? ['#CBD5E1', '#94A3B8']
                        : ['#3B82F6', '#2563EB']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={[
                      styles.buttonText,
                      (!isCodeValid || loading) && styles.buttonTextDisabled
                    ]}>
                      {loading ? 'Verifying...' : t('login.verifyCode')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleChangePhone} style={styles.changePhoneButton}>
                  <Text style={styles.changePhoneText}>{t('login.changePhone')}</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          {/* Footer - Hide when keyboard is open */}
          {!keyboardVisible && (
            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('Terms')}
                >
                  Terms of Service
                </Text>{' '}
                and{'\n'}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerKeyboardOpen: {
    justifyContent: 'flex-start',
    paddingTop: 40,
  },

  // Mascot - Clean, no shadow
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 0,
  },
  mascot: {
    width: 220,
    height: 220,
  },

  // Logo
  logoBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 46,
    fontWeight: '800',
    color: TEXT_DARK,
    textAlign: 'center',
  },
  logoAccent: {
    color: BRAND_BLUE,
  },
  logoSubtitle: {
    marginTop: 0,
    fontSize: 24,
    fontWeight: '600',
    color: TEXT_DARK,
    textAlign: 'center',
  },
  logoBlockSmall: {
    marginBottom: 16,
  },
  logoTextSmall: {
    fontSize: 32,
  },
  logoSubtitleSmall: {
    fontSize: 18,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 28,
  },

  // Phone Input
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
  },
  phoneRowFocused: {
    backgroundColor: '#F1F5F9',
  },
  countryBox: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: '500',
    color: TEXT_DARK,
    letterSpacing: 0,
  },
  phoneDisplay: {
    fontSize: 17,
    fontWeight: '600',
    color: BRAND_BLUE,
    marginBottom: 20,
  },

  // Code Input
  codeInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    letterSpacing: 12,
    marginBottom: 24,
  },
  codeInputFocused: {
    backgroundColor: '#F1F5F9',
  },

  // Button - Peach/Orange color
  buttonWrapper: {
    width: '100%',
  },
  buttonGradient: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.7)',
  },

  // Change Phone
  changePhoneButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  changePhoneText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_BLUE,
  },

  // Footer
  footer: {
    marginTop: 28,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    color: 'rgba(0,0,0,0.45)',
    lineHeight: 20,
  },
  footerLink: {
    color: BRAND_BLUE,
    fontWeight: '600',
  },
});
