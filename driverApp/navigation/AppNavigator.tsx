import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSizes } from '../config/colors';
import { RootStackParamList } from '../types';
import { useDriverStore } from '../stores/useDriverStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { IS_DEV } from '../config/environment';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import AuthPhoneScreen from '../screens/AuthPhoneScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import AskNameScreen from '../screens/AskNameScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ActiveOrderScreen from '../screens/ActiveOrderScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import NoInternetScreen from '../screens/NoInternetScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon: React.FC<{ icon?: string; image?: any; badge?: number; focused: boolean; size?: number }> = ({ icon, image, badge, size = 28 }) => {
  return (
    <View style={styles.tabIconContainer}>
      {image ? (
        <Image source={image} style={{ width: size, height: size }} resizeMode="contain" />
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
function TabNavigator() {
  const activeOrder = useDriverStore((state) => state.activeOrder);
  const t = useLanguageStore((state) => state.t);
  const insets = useSafeAreaInsets();

  // Show Active Order tab when there's an accepted order in progress
  const showActiveOrderTab = activeOrder !== null;

  // Calculate tab bar height with safe area
  const tabBarHeight = 60 + Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8),
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
        component={OrdersScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarAccessibilityLabel: 'Home tab, view available orders',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              image={require('../assets/tab-icons/home-icon.png')}
              focused={focused}
            />
          ),
        }}
      />
      {showActiveOrderTab && (
        <Tab.Screen
          name="ActiveOrderTab"
          component={ActiveOrderScreen}
          options={{
            tabBarLabel: t('tabs.active'),
            tabBarAccessibilityLabel: 'Active order, delivery in progress',
            tabBarIcon: ({ focused }) => (
              <TabIcon
                image={require('../assets/tab-icons/tracking-icon.png')}
                badge={1}
                focused={focused}
                size={38}
              />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: t('tabs.history'),
          tabBarAccessibilityLabel: 'History tab, view completed deliveries',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              image={require('../assets/tab-icons/orders-icon.png')}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarAccessibilityLabel: 'Profile tab, view account settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              image={require('../assets/tab-icons/profile-icon.png')}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

interface AppNavigatorProps {
  isAuthenticated: boolean;
}

export default function AppNavigator({ isAuthenticated }: AppNavigatorProps) {
  // In development mode, allow skipping auth for faster testing
  const skipAuth = IS_DEV && process.env.EXPO_PUBLIC_SKIP_AUTH === 'true';
  const effectiveAuth = skipAuth || isAuthenticated;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName={effectiveAuth ? 'Main' : 'Login'}
    >
      {/* Auth screens - always available for navigation */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AuthPhone" component={AuthPhoneScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="AskName" component={AskNameScreen} />

      {/* Main app screens */}
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />

      {/* Utility screens */}
      <Stack.Screen name="NoInternet" component={NoInternetScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
