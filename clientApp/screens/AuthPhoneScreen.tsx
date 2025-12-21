import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, Alert, ScrollView, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';
import { PhoneInputDuolingo } from '../components/PhoneInputDuolingo';
import { sendVerificationCode } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { validatePhoneNumber } from '../utils/validation';

type AuthPhoneScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'AuthPhone'>;
};

const AuthPhoneScreen: React.FC<AuthPhoneScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();
  const { t } = useLanguage();

  const valid = useMemo(() => validatePhoneNumber(`+998${phone.replace(/\s/g, '')}`), [phone]);

  const handleSendCode = async () => {
    if (!valid || loading) return;

    setLoading(true);
    try {
      const fullPhone = `+998${phone.replace(/\s/g, '')}`;
      await sendVerificationCode(fullPhone);
      navigation.navigate('VerifyCode', { phone: fullPhone });
    } catch (error: any) {
      // Check if error is because phone number doesn't exist
      const errorMessage = error.message || '';
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist') || errorMessage.includes('User not found')) {
        // Phone number doesn't exist in database
        Alert.alert(
          t('auth.phoneNotFound') || 'Phone Not Found',
          t('auth.phoneNotFoundMessage') || 'This phone number is not registered. Please sign up first.',
          [{ text: 'OK' }]
        );
      } else {
        showError(errorMessage || t('errors.sendCodeFailed') || 'Failed to send verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E9F7FF', '#F7FEFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.innerContent}>
                <View style={styles.content}>
                  {/* Phone Icon */}
                  <Text style={styles.phoneIcon}>📱</Text>

                  <Text style={styles.h1}>{t('auth.enterPhone')}</Text>
                  <Text style={styles.h2}>{t('auth.sendCodeMessage')}</Text>

                  <PhoneInputDuolingo
                    value={phone}
                    onChangeText={setPhone}
                    containerStyle={styles.inputWrap}
                  />
                </View>

                <View style={styles.footer}>
                  <PrimaryButton
                    title={t('auth.sendCode')}
                    onPress={handleSendCode}
                    disabled={!valid || loading}
                    loading={loading}
                    style={styles.button}
                    textStyle={styles.buttonText}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: '#0C1633',
  },
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
    gap: 8,
    paddingTop: 20,
  },
  phoneIcon: {
    fontSize: 100,
    marginBottom: 8,
  },
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0C1633',
    textAlign: 'center',
  },
  h2: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  inputWrap: { width: '100%' },
  footer: { paddingBottom: 20, paddingTop: 4 },
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
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
});

export default AuthPhoneScreen;
