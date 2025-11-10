import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthStackParamList, OrderStage } from '../types';
import { Colors, FontSizes } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';

// Auth Screens
import LoadingScreen from '../screens/LoadingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SelectLanguageScreen from '../screens/SelectLanguageScreen';
import AskNameScreen from '../screens/AskNameScreen';
import AuthPhoneScreen from '../screens/AuthPhoneScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import AddressSelectScreen from '../screens/AddressSelectScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import FirmDetailsScreen from '../screens/FirmDetailsScreen';
import CartScreen from '../screens/CartScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SelectAddressScreen from '../screens/SelectAddressScreen';
import AddressTypeScreen from '../screens/AddressTypeScreen';
import ApartmentDetailsScreen from '../screens/ApartmentDetailsScreen';
import OfficeDetailsScreen from '../screens/OfficeDetailsScreen';
import GovernmentDetailsScreen from '../screens/GovernmentDetailsScreen';
import AddressSummaryScreen from '../screens/AddressSummaryScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Loading" component={LoadingScreen} />
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="SelectLanguage" component={SelectLanguageScreen} />
      <AuthStack.Screen name="AskName" component={AskNameScreen} />
      <AuthStack.Screen name="AuthPhone" component={AuthPhoneScreen} />
      <AuthStack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <AuthStack.Screen name="AddressSelect" component={AddressSelectScreen} />
      <AuthStack.Screen name="SelectAddress" component={SelectAddressScreen} />
      <AuthStack.Screen name="AddressType" component={AddressTypeScreen} />
      <AuthStack.Screen name="ApartmentDetails" component={ApartmentDetailsScreen} />
      <AuthStack.Screen name="OfficeDetails" component={OfficeDetailsScreen} />
      <AuthStack.Screen name="GovernmentDetails" component={GovernmentDetailsScreen} />
      <AuthStack.Screen name="AddressSummary" component={AddressSummaryScreen} />
    </AuthStack.Navigator>
  );
};

// Tab Icon Component
const TabIcon: React.FC<{ icon: string; badge?: number }> = ({ icon, badge }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      {badge !== undefined && badge > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
};

// Bottom Tab Navigator
const TabNavigator = () => {
  const { cart } = useCart();
  const { currentOrder } = useOrder();
  const { t } = useLanguage();
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Show Tracking tab when there's an active order (not delivered)
  const showTrackingTab = currentOrder !== null && currentOrder.stage !== OrderStage.DELIVERED;

  // Show badge on Orders tab only when there's no Tracking tab
  const hasActiveOrder = currentOrder !== null;
  const ordersBadge = !showTrackingTab && hasActiveOrder ? 1 : 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grayText,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: () => <TabIcon icon="🏠" />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: t('tabs.cart'),
          tabBarIcon: () => <TabIcon icon="🛒" badge={cartItemCount} />,
        }}
      />
      {showTrackingTab && (
        <Tab.Screen
          name="TrackingTab"
          component={OrderTrackingScreen}
          options={{
            tabBarLabel: t('tabs.tracking'),
            tabBarIcon: () => <TabIcon icon="🚚" badge={1} />,
          }}
        />
      )}
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: t('tabs.orders'),
          tabBarIcon: () => <TabIcon icon="📦" badge={ordersBadge} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: () => <TabIcon icon="👤" />,
        }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator with Tabs + Modal Screens
export const MainNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <RootStack.Screen name="MainTabs" component={TabNavigator} />
      <RootStack.Screen name="FirmDetails" component={FirmDetailsScreen} />
      <RootStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <RootStack.Screen name="SelectAddress" component={SelectAddressScreen} />
      <RootStack.Screen name="AddressType" component={AddressTypeScreen} />
      <RootStack.Screen name="ApartmentDetails" component={ApartmentDetailsScreen} />
      <RootStack.Screen name="OfficeDetails" component={OfficeDetailsScreen} />
      <RootStack.Screen name="GovernmentDetails" component={GovernmentDetailsScreen} />
      <RootStack.Screen name="AddressSummary" component={AddressSummaryScreen} />
      <RootStack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <RootStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <RootStack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </RootStack.Navigator>
  );
};

interface AppNavigatorProps {
  isAuthenticated: boolean;
  onReady?: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ isAuthenticated, onReady }) => {
  return (
    <NavigationContainer onReady={onReady}>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  tabBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
