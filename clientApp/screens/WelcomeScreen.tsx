import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { useLanguage } from '../context/LanguageContext';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const { width } = Dimensions.get('window');

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  image: any;
  cta?: string;
};

const DOT_SIZE = 8;
const ONBOARDING_COMPLETED_KEY = '@watergo_onboarding_completed';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const SLIDES: Slide[] = useMemo(() => [
    {
      key: 'fast',
      title: t('auth.slide1Title'),
      subtitle: t('auth.slide1Description'),
      image: require('../assets/onboarding-fast-delivery.png'),
    },
    {
      key: 'updates',
      title: t('auth.slide3Title'),
      subtitle: t('auth.slide3Description'),
      image: require('../assets/onboarding-courier.png'),
    },
    {
      key: 'payment',
      title: t('auth.slide2Title'),
      subtitle: t('auth.slide2Description'),
      image: require('../assets/onboarding-payment.png'),
      cta: t('auth.getStarted'),
    },
  ], [t]);

  const isLast = index === SLIDES.length - 1;
  const primaryCta = useMemo(
    () => (isLast ? (SLIDES[index].cta ?? t('auth.getStarted')) : t('auth.next')),
    [index, isLast, SLIDES, t]
  );

  const goNext = useCallback(async () => {
    if (isLast) {
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      navigation.navigate('AuthPhone');
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [index, isLast, navigation]);

  const skip = useCallback(async () => {
    // Mark onboarding as completed
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    navigation.navigate('AuthPhone');
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#F3FBFF', '#F7FEFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>
            Water<Text style={styles.brandAccent}>Go</Text>
          </Text>
          <Pressable onPress={skip} hitSlop={8}>
            <Text style={styles.skip}>{t('auth.skip')}</Text>
          </Pressable>
        </View>

        {/* Slides Container */}
        <View style={styles.slidesContainer}>
          <FlatList
            ref={listRef}
            data={SLIDES}
            keyExtractor={(s) => s.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const next = Math.round(e.nativeEvent.contentOffset.x / width);
              setIndex(next);
            }}
            renderItem={({ item }) => (
              <View style={styles.slideWrapper}>
                <View style={styles.slideContent}>
                  {/* Image */}
                  <View style={styles.heroWrap}>
                    <Image
                      source={item.image}
                      style={styles.hero}
                      resizeMode="contain"
                      accessibilityIgnoresInvertColors
                    />
                  </View>

                  {/* Text */}
                  <View style={styles.textBlock}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => {
              const active = i === index;
              return (
                <View key={i} style={[styles.dot, active && styles.dotActive]} />
              );
            })}
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable style={styles.primaryBtn} onPress={goNext}>
              <Text style={styles.primaryText}>{primaryCta}</Text>
            </Pressable>

          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0C1633',
  },
  brandAccent: {
    color: '#5AA8FF',
  },
  skip: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
  },

  slidesContainer: {
    flex: 1,
  },
  slideWrapper: {
    width,
    flex: 1,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  hero: {
    width: width * 0.9,
    height: width * 0.9,
    minWidth: width * 0.9,
    minHeight: width * 0.9,
  },

  textBlock: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#0C1633',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: '#5B6472',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 300,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'rgba(12,22,51,0.15)',
  },
  dotActive: {
    width: DOT_SIZE * 3,
    borderRadius: DOT_SIZE,
    backgroundColor: '#2F7BFF',
  },

  buttons: {
    gap: 12,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 18,
    backgroundColor: '#2F7BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F7BFF',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
});

export default WelcomeScreen;
