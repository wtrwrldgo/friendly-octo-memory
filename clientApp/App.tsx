import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './navigation/AppNavigator';
import { UserProvider, useUser } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';
import { YaMap } from 'react-native-yamap';
import { YANDEX_MAPKIT_KEY } from './config/mapkit.config';

// Initialize Yandex MapKit
YaMap.init(YANDEX_MAPKIT_KEY);

// Main App Component with Providers
const App: React.FC = () => {
  return (
    <>
      <StatusBar style="dark" />
      <ToastProvider>
        <UserProvider>
          <CartProvider>
            <OrderProvider>
              <AppContent />
            </OrderProvider>
          </CartProvider>
        </UserProvider>
      </ToastProvider>
    </>
  );
};

// App Content with Navigation
const AppContent: React.FC = () => {
  const { user } = useUser();

  // User is authenticated if they have an ID
  const isAuthenticated = !!user?.id;

  return <AppNavigator isAuthenticated={isAuthenticated} />;
};

export default App;
