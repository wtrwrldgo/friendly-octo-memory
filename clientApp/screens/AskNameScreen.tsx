import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, SafeAreaView, TouchableOpacity
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
  const { updateUser } = useUser();
  const { t } = useLanguage();
  const valid = useMemo(() => name.trim().length >= 2, [name]);

  const handleContinue = () => {
    if (!valid) return;
    updateUser({ name: name.trim() });
    navigation.navigate('SelectAddress');
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
        >
          <View style={styles.content}>
            <Image
              source={require('../assets/illustrations/ask-name.png')}
              style={styles.mascot}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />

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
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              title={t('auth.continue')}
              onPress={handleContinue}
              disabled={!valid}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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

export default AskNameScreen;
