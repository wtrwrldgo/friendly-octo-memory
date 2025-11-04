import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { PhoneInput } from '../components/PhoneInput';
import { sendVerificationCode } from '../services/api';
import { useToast } from '../context/ToastContext';
import { validatePhoneNumber } from '../utils/validation';

type AuthPhoneScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'AuthPhone'>;
};

const AuthPhoneScreen: React.FC<AuthPhoneScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    const fullPhone = `+998${phone.replace(/\s/g, '')}`;
    const validation = validatePhoneNumber(fullPhone);

    if (!validation.isValid) {
      showError(validation.error || 'Invalid phone number');
      return;
    }

    setLoading(true);
    try {
      await sendVerificationCode(fullPhone);
      navigation.navigate('VerifyCode', { phone: fullPhone });
    } catch (error: any) {
      showError(error.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.centerContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.emoji,
              {
                transform: [
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-10deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            📱
          </Animated.Text>
          <Text style={styles.title}>Enter your phone</Text>
          <Text style={styles.subtitle}>We'll send you a verification code</Text>

          <View style={styles.inputContainer}>
            <PhoneInput value={phone} onChangeText={setPhone} />
          </View>

          <PrimaryButton
            title="Send Code"
            onPress={handleContinue}
            disabled={phone.replace(/\s/g, '').length !== 9}
            loading={loading}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  centerContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
    textAlign: 'center',
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
    color: Colors.grayText,
    marginBottom: Spacing.xxl,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
});

export default AuthPhoneScreen;
