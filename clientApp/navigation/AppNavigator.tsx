import React from 'react';
import { Text, View, StyleSheet, Image, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthStackParamList, OrderStage } from '../types';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';

// Auth Screens
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
import HouseDetailsScreen from '../screens/HouseDetailsScreen';
import OfficeDetailsScreen from '../screens/OfficeDetailsScreen';
import GovernmentDetailsScreen from '../screens/GovernmentDetailsScreen';
import AddressSummaryScreen from '../screens/AddressSummaryScreen';
import CityNotSupportedScreen from '../screens/CityNotSupportedScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="SelectLanguage"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="SelectLanguage" component={SelectLanguageScreen} />
      <AuthStack.Screen name="AskName" component={AskNameScreen} />
      <AuthStack.Screen name="AuthPhone" component={AuthPhoneScreen} />
      <AuthStack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <AuthStack.Screen name="AddressSelect" component={AddressSelectScreen} />
      <AuthStack.Screen name="SelectAddress" component={SelectAddressScreen} />
      <AuthStack.Screen name="AddressType" component={AddressTypeScreen} />
      <AuthStack.Screen name="ApartmentDetails" component={ApartmentDetailsScreen} />
      <AuthStack.Screen name="HouseDetails" component={HouseDetailsScreen} />
      <AuthStack.Screen name="OfficeDetails" component={OfficeDetailsScreen} />
      <AuthStack.Screen name="GovernmentDetails" component={GovernmentDetailsScreen} />
      <AuthStack.Screen name="AddressSummary" component={AddressSummaryScreen} />
      <AuthStack.Screen name="CityNotSupported" component={CityNotSupportedScreen} />
    </AuthStack.Navigator>
  );
};

// Tab Icon Component
const TabIcon: React.FC<{ icon?: string; image?: any; badge?: number }> = ({ icon, image, badge }) => {
  return (
    <View style={styles.tabIconContainer}>
      {image ? (
        <Image source={image} style={styles.tabImage} resizeMode="contain" />
      ) : (
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      )}
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
  const insets = useSafeAreaInsets();
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Show Tracking tab when there's an active order (not delivered)
  const showTrackingTab = currentOrder !== null && currentOrder.stage !== OrderStage.DELIVERED;

  // Show badge on Orders tab only when there's no Tracking tab
  const hasActiveOrder = currentOrder !== null;
  const ordersBadge = !showTrackingTab && hasActiveOrder ? 1 : 0;

  // Calculate bottom padding for system navigation bar
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 10) : 8;
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#B8BCC4',
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: '#F0F1F3',
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: () => <TabIcon image={require('../assets/tab-icons/home-icon.png')} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: t('tabs.cart'),
          tabBarIcon: () => <TabIcon image={require('../assets/tab-icons/cart-icon.png')} badge={cartItemCount} />,
        }}
      />
      {showTrackingTab && (
        <Tab.Screen
          name="TrackingTab"
          component={OrderTrackingScreen}
          options={{
            tabBarLabel: t('tabs.tracking'),
            tabBarIcon: () => <TabIcon image={require('../assets/tab-icons/tracking-icon.png')} badge={1} />,
          }}
        />
      )}
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: t('tabs.orders'),
          tabBarIcon: () => <TabIcon image={require('../assets/tab-icons/orders-icon.png')} badge={ordersBadge} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: () => <TabIcon image={require('../assets/tab-icons/profile-icon.png')} />,
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
      <RootStack.Screen name="HouseDetails" component={HouseDetailsScreen} />
      <RootStack.Screen name="OfficeDetails" component={OfficeDetailsScreen} />
      <RootStack.Screen name="GovernmentDetails" component={GovernmentDetailsScreen} />
      <RootStack.Screen name="AddressSummary" component={AddressSummaryScreen} />
      <RootStack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <RootStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <RootStack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <RootStack.Screen name="CityNotSupported" component={CityNotSupportedScreen} />
    </RootStack.Navigator>
  );
};

interface AppNavigatorProps {
  isAuthenticated: boolean;
  onReady?: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ isAuthenticated, onReady }) => {
  console.log('🧭 [AppNavigator] Rendering - isAuthenticated:', isAuthenticated);
  console.log('🧭 [AppNavigator] Will render:', isAuthenticated ? 'MainNavigator' : 'AuthNavigator');

  return (
    <NavigationContainer onReady={() => {
      console.log('🧭 [NavigationContainer] Ready!');
      onReady?.();
    }}>
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
  tabImage: {
    width: 36,
    height: 36,
  },
});
