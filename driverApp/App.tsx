import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import YaMap from 'react-native-yamap';
import { queryClient } from './config/queryClient';
import { useAuthStore } from './stores/useAuthStore';
import { useDriverStore } from './stores/useDriverStore';
import { useLanguageStore } from './stores/useLanguageStore';
import { ToastProvider } from './context/ToastContext';
import AppNavigator from './navigation/AppNavigator';
import { YANDEX_MAPKIT_KEY } from './config/mapkit.config';

// Hide splash screen
SplashScreen.preventAutoHideAsync().catch(() => {});

// Initialize Yandex MapKit
YaMap.init(YANDEX_MAPKIT_KEY);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Hide splash screen on mount
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        await useDriverStore.getState().loadDriverData();
        await useLanguageStore.getState().loadLanguage();
      } catch (error) {
        console.error('[App] Init error:', error);
      }
    };
    init();

    // Load tokens
    useAuthStore.getState().loadTokens()
      .then(() => {
        const token = useAuthStore.getState().accessToken;
        setSession(token ? { accessToken: token } : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Timeout fallback
    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  const driver = useDriverStore((state) => state.driver);
  const setSessionAction = useAuthStore((state) => state.setSession);

  // Sync session
  useEffect(() => {
    setSessionAction(session);
  }, [session, setSessionAction]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <StatusBar style="dark" />
          <ActivityIndicator size="large" color="#4D7EFF" />
          <Text style={styles.loadingText}>Loading WaterGo...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const isAuthenticated = !!(session || driver);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <NavigationContainer>
            <AppNavigator isAuthenticated={isAuthenticated} />
          </NavigationContainer>
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FEFF',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4D7EFF',
    marginTop: 20,
  },
});
