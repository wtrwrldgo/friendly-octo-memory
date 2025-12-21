import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../types';

type LoadingScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Loading'>;
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ navigation }) => {
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const navigateToSelectLanguage = async () => {
      console.log('📱 [LoadingScreen] Component mounted! Navigating to SelectLanguage...');

      // Use setTimeout to ensure navigation happens after component is fully mounted
      setTimeout(() => {
        // Only navigate if component is still mounted
        if (!isMounted) {
          console.log('📱 [LoadingScreen] Component unmounted, skipping navigation');
          return;
        }

        // Always navigate to SelectLanguage first
        // The SelectLanguage screen will pre-select any stored language
        console.log('📱 [LoadingScreen] Navigating to SelectLanguage...');
        navigation.replace('SelectLanguage');
      }, 1500); // Show loading screen for 1.5 seconds
    };

    navigateToSelectLanguage();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#E9F7FF', '#F7FEFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        {/* Spinner at the TOP */}
        <View style={styles.topLoader}>
          <ActivityIndicator size="large" color="#62B7FF" />
        </View>

        {/* Center content */}
        <View style={styles.center}>
          <Image
            source={require('../assets/watergo-loading.png')}
            style={styles.mascot}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            <Text style={styles.titleWater}>Water</Text>
            <Text style={styles.titleGo}>Go</Text>
          </Text>
          <Text style={styles.sub}>Loading...</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safe: {
    flex: 1
  },
  topLoader: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 4 : 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mascot: {
    width: 320,
    height: 320,
    marginBottom: 16
  },
  title: {
    fontSize: 64,
    fontWeight: '800',
  },
  titleWater: {
    color: '#0C1633'
  },
  titleGo: {
    color: '#62B7FF'
  },
  sub: {
    fontSize: 28,
    color: '#6B7280',
    marginTop: 8
  },
});

export default LoadingScreen;
