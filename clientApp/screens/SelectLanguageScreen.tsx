import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image, Animated, Easing, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { LANGUAGES } from '../constants/MockData';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SelectLanguage'>;
};

const CARD_H = 80;
const RADIUS = 20;

const SelectLanguageScreen: React.FC<Props> = ({ navigation }) => {
  const { setLanguage, t } = useLanguage();
  const [selected, setSelected] = useState<Language>('en');

  const getLanguageName = (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  };

  const onContinue = () => {
    setLanguage(selected);
    navigation.navigate('Welcome');
  };

  return (
    <LinearGradient colors={['#E9F7FF', '#F7FEFF']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require('../assets/globe-3d.png')}
            style={styles.globe}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.title}>{t('auth.selectLanguage') || 'Select Your Language'}</Text>
        </View>

        {/* LIST */}
        <View style={styles.listContainer}>
          {LANGUAGES.map((l) => {
            let flagImage;
            if (l.code === 'en') flagImage = require('../assets/flag-usa.png');
            else if (l.code === 'ru') flagImage = require('../assets/flag-russia.png');
            else if (l.code === 'uz') flagImage = require('../assets/flag-uzbekistan.png');
            else if (l.code === 'kaa') flagImage = require('../assets/flag-karakalpakstan.png');

            return (
              <LanguageCard
                key={l.code}
                name={getLanguageName(l.code)}
                flagImage={flagImage}
                active={selected === (l.code as Language)}
                onPress={() => setSelected(l.code as Language)}
              />
            );
          })}
        </View>

        {/* CTA */}
        <Pressable onPress={onContinue} disabled={!selected} style={[styles.button, !selected && { opacity: 0.5 }]}>
          <Text style={styles.buttonText}>{t('auth.continue') || 'Continue'}</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
};

function LanguageCard({
  name,
  flagImage,
  active,
  onPress,
}: {
  name: string;
  flagImage: any;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useMemo(() => new Animated.Value(1), []);
  const animateIn = () =>
    Animated.timing(scale, { toValue: 0.98, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  const animateOut = () =>
    Animated.timing(scale, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 14 }}>
      <Pressable
        onPress={onPress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        android_ripple={{ color: 'rgba(47,123,255,0.08)' }}
        style={[styles.card, active && styles.cardActive]}
      >
        <Image source={flagImage} style={styles.flagImage} resizeMode="contain" />
        <Text style={styles.languageName}>{name}</Text>

        {/* checkmark for active */}
        {active && <Ionicons name="checkmark-circle" size={24} color="#2F7BFF" />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 24, paddingBottom: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20, marginTop: -20 },
  globe: {
    width: 138,
    height: 138,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0C1633',
    textAlign: 'center',
  },

  listContainer: { marginBottom: 16 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CARD_H,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(12,22,51,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardActive: {
    borderColor: '#2F7BFF',
    borderWidth: 2,
    backgroundColor: '#E9F2FF',
    shadowColor: '#2F7BFF',
    shadowOpacity: 0.16,
  },
  flagImage: { width: 40, height: 40, marginRight: 14, borderRadius: 6 },
  languageName: { fontSize: 20, fontWeight: '700', color: '#0C1633', flex: 1 },
  check: {
    marginLeft: 'auto',
    fontSize: 22,
    fontWeight: '800',
    color: '#2F7BFF',
  },

  button: {
    height: 64,
    borderRadius: 22,
    backgroundColor: '#2F7BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F7BFF',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    ...Platform.select({ android: { elevation: 4 } }),
  },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
});

export default SelectLanguageScreen;
