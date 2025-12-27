import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, SafeAreaView, TouchableOpacity, Keyboard, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

type AskNameScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'AskName'>;
};

const AskNameScreen: React.FC<AskNameScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { updateUser } = useUser();
  const { t } = useLanguage();
  const valid = useMemo(() => name.trim().length >= 2, [name]);

  // Hide mascot when keyboard is open
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleContinue = async () => {
    if (!valid) return;
    const trimmedName = name.trim();
    updateUser({ name: trimmedName });

    // Also save name to API
    try {
      const ApiService = require('../services/api').default;
      await ApiService.updateUserProfile({ name: trimmedName });
      console.log('Name saved to API:', trimmedName);
    } catch (err) {
      console.log('Could not save name to API:', err);
    }

    // Navigate to SelectAddress for first address setup
    navigation.navigate('SelectAddress', { isFirstAddress: true });
  };

  return (
    <LinearGradient
      colors={['#E9F7FF', '#F7FEFF']} // light blue -> very light
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
          <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color="#1E293B" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.content}>
              {/* Hide mascot when keyboard is open */}
              {!keyboardVisible && (
                <Image
                  source={require('../assets/illustrations/ask-name.png')}
                  style={styles.mascot}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              )}

              <Text style={styles.h1}>
                {t('auth.heyThere')} <Text style={{ fontSize: 28 }}>👋</Text>
              </Text>
              <Text style={styles.h2}>{t('auth.whatShouldWeCallYou')}</Text>

              <TextField
                label=""
                value={name}
                onChangeText={setName}
                placeholder={t('auth.namePlaceholder')}
                containerStyle={styles.inputWrap}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />

              {/* Spacing between input and button */}
              <View style={{ height: keyboardVisible ? 20 : 0 }} />
            </View>

            <View style={[styles.footer, keyboardVisible && styles.footerKeyboard]}>
              <PrimaryButton
                title={t('auth.continue')}
                onPress={handleContinue}
                disabled={!valid}
                style={styles.button}
                textStyle={styles.buttonText}
              />
            </View>
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
  container: { flex: 1, paddingHorizontal: 24 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  mascot: { width: 280, height: 280, marginBottom: 6 },
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0C1633',
    textAlign: 'center',
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C1633',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 18,
  },
  inputWrap: { width: '100%' },
  input: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    height: 68,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  footer: {
    paddingBottom: 20,
    paddingTop: 16,
  },
  footerKeyboard: {
    paddingTop: 8,
    paddingBottom: 12,
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
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
});

export default AskNameScreen;
