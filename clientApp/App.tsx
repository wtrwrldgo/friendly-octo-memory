import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './navigation/AppNavigator';
import { UserProvider, useUser } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import { YaMap } from 'react-native-yamap';
import { YANDEX_MAPKIT_KEY } from './config/mapkit.config';

// Yandex MapKit will be initialized in AppContent component
let mapKitInitialized = false;

// Animated Loading Screen Component
const LoadingScreen: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, []);

  const getDotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [{
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.2],
      }),
    }],
  });

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCenter}>
        <Text style={styles.loadingTitle}>
          <Text style={styles.loadingTitleWater}>Water</Text>
          <Text style={styles.loadingTitleGo}>Go</Text>
        </Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
          <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
          <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
        </View>
      </View>
    </View>
  );
};

// Main App Component with Providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <ToastProvider>
        <UserProvider>
          <LanguageProvider>
            <CartProvider>
              <OrderProvider>
                <AppContent />
              </OrderProvider>
            </CartProvider>
          </LanguageProvider>
        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

// App Content with Navigation
const AppContent: React.FC = () => {
  const { user, addresses, isLoaded } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mapKitReady, setMapKitReady] = useState(false);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  // Initialize Yandex MapKit
  useEffect(() => {
    async function initMapKit() {
      try {
        if (!mapKitInitialized) {
          console.log('🗺️ [AppContent] Initializing Yandex MapKit...');
          try {
            YaMap.setLocale('en_US');
            YaMap.init(YANDEX_MAPKIT_KEY);
            mapKitInitialized = true;
            console.log('✅ [AppContent] Yandex MapKit initialized!');
          } catch (initError) {
            console.error('❌ [AppContent] YaMap.init() failed:', initError);
          }
        }
        setMapKitReady(true);
      } catch (e) {
        console.warn(e);
        setMapKitReady(true);
      }
    }
    initMapKit();
  }, []);

  // Minimum loading screen display time (1.5 seconds for animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Watch for authentication state changes (only after user data is loaded)
  useEffect(() => {
    if (!isLoaded) return;

    // Check if user is authenticated:
    // 1. Has user ID (from backend) - means user verified phone
    // 2. Has at least one address (completed onboarding)
    // Note: Name check removed - returning users may have default 'User' name
    const hasUserId = !!user?.id;
    const hasAddresses = addresses.length > 0;
    const isFullyAuthenticated = hasUserId && hasAddresses;
    setIsAuthenticated(isFullyAuthenticated);

    console.log('🔐 [Auth Check] User ID:', user?.id);
    console.log('🔐 [Auth Check] User Name:', user?.name);
    console.log('🔐 [Auth Check] Addresses:', addresses.length);
    console.log('🔐 [Auth Check] Is Authenticated:', isFullyAuthenticated);
  }, [isLoaded, user?.id, user?.name, addresses.length]);

  // App is ready when: MapKit initialized, user data loaded, and minimum loading time passed
  const appIsReady = mapKitReady && isLoaded && minLoadingComplete;

  console.log('🚀 [AppContent] mapKitReady:', mapKitReady, 'isLoaded:', isLoaded, 'minLoading:', minLoadingComplete, 'auth:', isAuthenticated);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  console.log('✅ [AppContent] App ready! Rendering AppNavigator');
  return <AppNavigator isAuthenticated={isAuthenticated} />;
};

const styles = StyleSheet.create({
  // Minimal Uber-style loading screen
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  loadingTitleWater: {
    color: '#0C1633',
    fontWeight: '700',
  },
  loadingTitleGo: {
    color: '#3B66FF',
    fontWeight: '800',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B66FF',
  },
});

export default App;
