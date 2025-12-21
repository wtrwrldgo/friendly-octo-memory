import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Platform } from 'react-native';
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
  const { user, addresses } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialize Yandex MapKit and prepare app
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Yandex MapKit once
        if (!mapKitInitialized) {
          console.log('🗺️ [AppContent] Initializing Yandex MapKit...');
          console.log('🗺️ [AppContent] API Key:', YANDEX_MAPKIT_KEY);
          try {
            // Set locale BEFORE initialize (required by MapKit)
            YaMap.setLocale('en_US');
            console.log('✅ [AppContent] Locale set to en_US');

            // Initialize MapKit with API key
            YaMap.init(YANDEX_MAPKIT_KEY);

            mapKitInitialized = true;
            console.log('✅ [AppContent] Yandex MapKit initialized successfully!');
          } catch (initError) {
            console.error('❌ [AppContent] YaMap.init() failed:', initError);
          }
        } else {
          console.log('ℹ️ [AppContent] YaMap already initialized, skipping');
        }

        // App is ready immediately - no artificial delay
        setAppIsReady(true);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  // Watch for authentication state changes
  useEffect(() => {
    // Check if user is authenticated:
    // 1. Has user ID (from backend)
    // 2. Has proper name (not 'Guest')
    // Note: Address is only required for initial onboarding, not to stay logged in
    const hasUserId = !!user?.id;
    const hasProperName = !!user?.name && user.name !== 'Guest' && user.name !== 'User';
    const isFullyAuthenticated = hasUserId && hasProperName;
    setIsAuthenticated(isFullyAuthenticated);

    console.log('🔐 [Auth Check] User ID:', user?.id);
    console.log('🔐 [Auth Check] User Name:', user?.name);
    console.log('🔐 [Auth Check] Addresses:', addresses.length);
    console.log('🔐 [Auth Check] Is Authenticated:', isFullyAuthenticated);
  }, [user?.id, user?.name]);

  console.log('🚀 [AppContent] Render - appIsReady:', appIsReady, 'isAuthenticated:', isAuthenticated);

  if (!appIsReady) {
    console.log('⏳ [AppContent] App not ready yet, showing loading screen');
    return (
      <View style={styles.container}>
        <View style={styles.topLoader}>
          <ActivityIndicator size="large" color="#62B7FF" />
        </View>
        <View style={styles.center}>
          <Image
            source={require('./assets/watergo-loading.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            <Text style={styles.titleWater}>Water</Text>
            <Text style={styles.titleGo}>Go</Text>
          </Text>
          <Text style={styles.sub}>Loading...</Text>
        </View>
      </View>
    );
  }

  console.log('✅ [AppContent] App ready! Rendering AppNavigator');
  return <AppNavigator isAuthenticated={isAuthenticated} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F7FF',
  },
  safe: {
    flex: 1,
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
    justifyContent: 'center',
  },
  mascot: {
    width: 320,
    height: 320,
    marginBottom: 16,
  },
  title: {
    fontSize: 64,
    fontWeight: '800',
  },
  titleWater: {
    color: '#0C1633',
  },
  titleGo: {
    color: '#62B7FF',
  },
  sub: {
    fontSize: 28,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default App;
