import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';

export default function CityNotSupportedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();

  const cityName = route.params?.cityName || '';

  const handleChangeAddress = () => {
    // Go back to SelectAddress screen
    navigation.navigate('SelectAddress');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/mascot/water-drop-mascot.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('cityNotSupported.title')}</Text>
          <Text style={styles.subtitle}>{t('cityNotSupported.subtitle')}</Text>

          {cityName ? (
            <View style={styles.cityBadge}>
              <Text style={styles.cityText}>{cityName}</Text>
            </View>
          ) : null}

          <Text style={styles.description}>
            {t('cityNotSupported.description')}
          </Text>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.changeButton}
            onPress={handleChangeAddress}
          >
            <Text style={styles.changeButtonText}>
              {t('cityNotSupported.changeAddress')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mascot: {
    width: 200,
    height: 200,
    opacity: 0.9,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0C1633',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  cityBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  description: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  changeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
