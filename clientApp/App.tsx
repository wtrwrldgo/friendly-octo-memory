import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './navigation/AppNavigator';
import { UserProvider, useUser } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import { YaMap } from 'react-native-yamap';
import { YANDEX_MAPKIT_KEY } from './config/mapkit.config';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Initialize Yandex MapKit
console.log('🗺️ Initializing Yandex MapKit with API key:', YANDEX_MAPKIT_KEY);
try {
  YaMap.init(YANDEX_MAPKIT_KEY);
  console.log('✅ Yandex MapKit initialized successfully (JavaScript layer)');
  console.log('📍 Map tiles should now be able to load');
} catch (error) {
  console.error('❌ Failed to initialize Yandex MapKit:', error);
}

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

  // Hide splash screen when app is ready
  useEffect(() => {
    async function prepare() {
      try {
        // App is ready immediately - no artificial delay
        setAppIsReady(true);
        // Hide splash screen as fast as possible
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    // Layout is ready
  }, []);

  // Watch for authentication state changes
  useEffect(() => {
    const hasUserId = !!user?.id;
    const hasAddresses = addresses.length > 0;
    const authStatus = hasUserId && hasAddresses;

    // Debug logging
    console.log('=== App.tsx Authentication Check (useEffect) ===');
    console.log('User object:', user);
    console.log('User ID:', user?.id, '| Has ID:', hasUserId);
    console.log('Addresses array:', addresses);
    console.log('Addresses count:', addresses.length, '| Has Addresses:', hasAddresses);
    console.log('Previous Auth Status:', isAuthenticated);
    console.log('New Auth Status (hasUserId && hasAddresses):', authStatus);
    console.log('==============================================');

    if (authStatus !== isAuthenticated) {
      console.log('🔄 Authentication status changed! Switching navigator...');
      console.log('🔄 Switching from', isAuthenticated ? 'MainNavigator' : 'AuthNavigator', 'to', authStatus ? 'MainNavigator' : 'AuthNavigator');
      setIsAuthenticated(authStatus);
    } else {
      console.log('⏸️  No change in authentication status. Staying on', isAuthenticated ? 'MainNavigator' : 'AuthNavigator');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, addresses.length]);

  if (!appIsReady) {
    return null;
  }

  return <AppNavigator isAuthenticated={isAuthenticated} onReady={onLayoutRootView} />;
};

export default App;
