import { create } from 'zustand';
import { Driver } from '../types';
import StorageService from '../services/storage.service';
import ApiService from '../services/api.service';
import NotificationService from '../services/notification.service';
import LocationService, { LocationData } from '../services/location.service';
import RealtimeService from '../services/realtime.service';
import { useAuthStore } from './useAuthStore';
import ENV_CONFIG, { logDev } from '../config/environment';
import SentryService from '../services/sentry.service';

interface DriverStore {
  // State
  driver: Driver | null;
  isOnline: boolean;
  activeOrder: any | null;
  currentLocation: LocationData | null;
  isLocationTracking: boolean;

  // Actions
  setDriver: (driver: Driver | null) => Promise<void>;
  setIsOnline: (status: boolean) => Promise<void>;
  setActiveOrder: (order: any | null) => void;
  toggleOnlineStatus: () => Promise<void>;
  updateDriverName: (name: string) => Promise<void>;
  updateDriverDistrict: (district: string) => Promise<void>;
  updateVehicleInfo: (vehicleModel: string, vehicleNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshDriver: () => Promise<void>;
  loadDriverData: () => Promise<void>;
  registerPushToken: () => Promise<void>;
  checkDriverStatus: (driver: Driver) => Promise<void>;
  initializeRealtimeSubscriptions: () => void;
  cleanupRealtimeSubscriptions: () => void;

  // Location actions
  updateCurrentLocation: (location: LocationData) => void;
  startLocationTracking: () => Promise<boolean>;
  stopLocationTracking: () => Promise<void>;
  getCurrentLocation: () => Promise<LocationData | null>;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  // Initial state
  driver: null,
  isOnline: false,
  activeOrder: null,
  currentLocation: null,
  isLocationTracking: false,

  // Load driver data from storage
  loadDriverData: async () => {
    try {
      // Load driver from storage (set during login)
      const storedDriver = await StorageService.getDriver<Driver>();

      if (storedDriver) {
        logDev('Driver loaded from storage:', storedDriver.name, 'ID:', storedDriver.id);

        // Validate driver exists in backend (skip in mock mode)
        if (!ENV_CONFIG.useMockData) {
          try {
            const validDriver = await ApiService.getDriverProfile(storedDriver.id);
            if (!validDriver) {
              logDev('Driver not found in backend - clearing cached data');
              await StorageService.clearAll();
              await useAuthStore.getState().clearTokens();
              set({ driver: null, isOnline: false });
              return;
            }
            // Use fresh data from backend
            set({ driver: validDriver });
            await StorageService.setDriver(validDriver);

            // Check driver status (block if deleted/inactive)
            get().checkDriverStatus(validDriver);

            // Set user context in Sentry for crash reporting
            SentryService.setUser(validDriver.id, undefined, validDriver.name);
          } catch (error: any) {
            const errorMessage = error?.message?.toLowerCase() || '';
            // Check if it's a 404 error (driver not found) - be specific to avoid false positives
            // Don't treat auth errors ("session expired", "failed to refresh") as "not found"
            const isDriverNotFound =
              error?.response?.status === 404 ||
              errorMessage.includes('driver not found') ||
              errorMessage.includes('not found in database');

            // Check if it's an auth error - don't clear driver data for auth issues
            const isAuthError =
              error?.response?.status === 401 ||
              errorMessage.includes('session expired') ||
              errorMessage.includes('unauthorized') ||
              errorMessage.includes('log in again');

            if (isDriverNotFound && !isAuthError) {
              logDev('Driver not found - clearing cached data. Error:', error?.message);
              await StorageService.clearAll();
              await useAuthStore.getState().clearTokens();
              set({ driver: null, isOnline: false });
              return;
            }
            // Network/auth error - use cached data but don't block the user
            logDev('Could not validate driver (network/auth error), using cached data');
            set({ driver: storedDriver });
          }
        } else {
          set({ driver: storedDriver });
        }

        // Register push token after driver is set
        get().registerPushToken();

        // Initialize real-time subscriptions
        get().initializeRealtimeSubscriptions();
      }

      // Load online status from storage
      const storedOnlineStatus = await StorageService.getOnlineStatus();
      set({ isOnline: storedOnlineStatus });
    } catch (error) {
      console.error('Error loading driver data:', error);
    }
  },

  // Register push token
  registerPushToken: async () => {
    const { driver } = get();
    if (!driver) return;

    // Skip push token registration in mock data mode to avoid warnings
    if (ENV_CONFIG.useMockData) {
      logDev('Skipping push token registration (mock data mode)');
      return;
    }

    try {
      const pushToken = await NotificationService.getExpoPushToken();
      if (pushToken) {
        await NotificationService.registerPushToken(driver.id, pushToken);
        console.log('Push token registered for driver:', driver.id);
      }
    } catch (error) {
      console.error('Error registering push token:', error);
      // Don't throw - push tokens are not critical for app functionality
    }
  },

  // Initialize real-time subscriptions for orders
  initializeRealtimeSubscriptions: () => {
    const { driver } = get();
    if (!driver) return;

    // Skip in mock data mode
    if (ENV_CONFIG.useMockData) {
      logDev('Skipping real-time subscriptions (mock data mode)');
      return;
    }

    logDev('Initializing real-time subscriptions for driver:', driver.id);

    // Subscribe to new orders in driver's district
    RealtimeService.subscribeToNewOrders(driver.district || undefined);

    // Listen for new orders
    RealtimeService.onNewOrder((order) => {
      console.log('[Store] New order received:', order.id);
      // Show local notification for new order
      NotificationService.showLocalNotification(
        'New Order Available!',
        `Order #${order.id.slice(0, 8)} - ${(order as any).addresses?.address || 'Unknown location'}`
      );
    });

    // Listen for order updates
    RealtimeService.onOrderUpdate((orderId, stage) => {
      console.log('[Store] Order updated:', orderId, 'Stage:', stage);
      // If this is the active order, we may need to refresh it
      const { activeOrder } = get();
      if (activeOrder && activeOrder.id === orderId) {
        // Order stage changed, we should refresh the active order in the component
        console.log('[Store] Active order stage changed to:', stage);
      }
    });

    // Listen for cancelled orders
    RealtimeService.onOrderCancelled((order) => {
      console.log('[Store] Order cancelled:', order.id);
      // Show notification if it was the active order
      const { activeOrder } = get();
      if (activeOrder && activeOrder.id === order.id) {
        NotificationService.showLocalNotification(
          'Order Cancelled',
          `Order #${order.id.slice(0, 8)} has been cancelled`
        );
        set({ activeOrder: null });
      }
    });
  },

  // Cleanup real-time subscriptions
  cleanupRealtimeSubscriptions: () => {
    logDev('Cleaning up real-time subscriptions');
    RealtimeService.unsubscribeFromOrders();
    RealtimeService.clearCallbacks();
  },

  // Set driver
  setDriver: async (driverData: Driver | null) => {
    set({ driver: driverData });
    if (driverData) {
      await StorageService.setDriver(driverData);
    } else {
      await StorageService.removeDriverData();
    }
  },

  // Set online status
  setIsOnline: async (status: boolean) => {
    set({ isOnline: status });
    await StorageService.setOnlineStatus(status);
  },

  // Set active order
  setActiveOrder: (order: any | null) => {
    set({ activeOrder: order });
  },

  // Toggle online status
  toggleOnlineStatus: async () => {
    const { driver, isOnline, setDriver, setIsOnline } = get();
    if (!driver) return;

    const newStatus = !isOnline;

    // Optimistic update - update UI immediately
    await setIsOnline(newStatus);
    const updatedDriver = { ...driver, is_active: newStatus, is_available: newStatus };
    await setDriver(updatedDriver);

    // Try to sync with server (don't throw if fails)
    try {
      await ApiService.updateDriverOnlineStatus(driver.id, newStatus);
    } catch (error: any) {
      logDev('Error syncing online status:', error);
      // Don't revert - keep local state, will sync on next successful call
    }
  },

  // Update driver name
  updateDriverName: async (name: string) => {
    const { driver, setDriver } = get();
    if (!driver) return;

    try {
      await ApiService.updateDriverName(driver.id, name);

      // Update local driver object
      const updatedDriver = { ...driver, name };
      await setDriver(updatedDriver);
    } catch (error: any) {
      console.error('Error updating driver name:', error);
      throw error;
    }
  },

  // Update driver district
  updateDriverDistrict: async (district: string) => {
    const { driver, setDriver } = get();
    if (!driver) return;

    try {
      await ApiService.updateDriverDistrict(driver.id, district);

      // Update local driver object
      const updatedDriver = { ...driver, district };
      await setDriver(updatedDriver);
    } catch (error: any) {
      console.error('Error updating driver district:', error);
      throw error;
    }
  },

  // Update vehicle info
  updateVehicleInfo: async (vehicleModel: string, vehicleNumber: string) => {
    const { driver, setDriver } = get();
    if (!driver) return;

    try {
      // TODO: Add API call when backend endpoint is ready
      // Backend endpoint needed: PATCH /api/drivers/{id}/vehicle
      // Payload: { vehicle_model: string, vehicle_number: string }
      // await ApiService.updateVehicleInfo(driver.id, vehicleModel, vehicleNumber);

      // Update local driver object (temporary until backend is ready)
      const updatedDriver = { ...driver, vehicle_model: vehicleModel, vehicle_number: vehicleNumber };
      await setDriver(updatedDriver);
    } catch (error: any) {
      console.error('Error updating vehicle info:', error);
      throw error;
    }
  },

  // Refresh driver data from API
  refreshDriver: async () => {
    const { driver, setDriver } = get();
    if (!driver) return;

    try {
      const updatedDriver = await ApiService.getDriverProfile(driver.id);
      await setDriver(updatedDriver);
      set({ isOnline: updatedDriver.is_active || false });

      // Check driver status (block if deleted/inactive)
      get().checkDriverStatus(updatedDriver);
    } catch (error) {
      console.error('Error refreshing driver:', error);
    }
  },

  // Logout
  logout: async () => {
    const { driver, isOnline, stopLocationTracking, cleanupRealtimeSubscriptions } = get();

    try {
      // Clear Sentry user context
      SentryService.clearUser();

      // Cleanup real-time subscriptions
      cleanupRealtimeSubscriptions();

      // Stop location tracking before logout
      await stopLocationTracking();

      // Remove push token before logout
      if (driver) {
        try {
          await NotificationService.removePushToken(driver.id);
        } catch (error) {
          console.error('Error removing push token:', error);
          // Continue with logout even if push token removal fails
        }
      }

      // Set driver offline before logout
      if (driver && isOnline) {
        try {
          await ApiService.updateDriverOnlineStatus(driver.id, false);
        } catch (error) {
          console.error('Error setting driver offline:', error);
          // Continue with logout even if this fails
        }
      }

      // Sign out - call backend logout and clear tokens
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          await fetch(`${ENV_CONFIG.apiUrl}/auth/mobile/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
        } catch (error) {
          console.error('Error calling logout endpoint:', error);
          // Continue with local logout even if backend call fails
        }
      }
      await useAuthStore.getState().clearTokens();

      // Clear local storage
      await StorageService.clearAll();

      // Clear state
      set({
        driver: null,
        isOnline: false,
        activeOrder: null,
        currentLocation: null,
        isLocationTracking: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  // Check driver status and logout if deleted/inactive
  checkDriverStatus: async (driverData: Driver) => {
    const status = driverData.status;
    // Logout if status is 'deleted' or 'inactive'
    const shouldLogout = status === 'deleted' || status === 'inactive';

    if (shouldLogout) {
      logDev('Driver account deleted/inactive - logging out. Status:', status);
      // Clear all data and logout
      await get().logout();
    }
  },

  // ============================================
  // Location tracking
  // ============================================

  // Update current location
  updateCurrentLocation: (location: LocationData) => {
    set({ currentLocation: location });

    // Also update in API if driver is online
    const { driver } = get();
    if (driver) {
      ApiService.updateDriverLocation(
        driver.id,
        location.latitude,
        location.longitude
      ).catch((error) => {
        console.error('Error updating location in API:', error);
      });
    }
  },

  // Get current location (one-time)
  getCurrentLocation: async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        set({ currentLocation: location });
      }
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  },

  // Start location tracking
  startLocationTracking: async () => {
    const { driver } = get();
    if (!driver) {
      console.log('Cannot start tracking: no driver');
      return false;
    }

    try {
      // Request permissions first
      const permissions = await LocationService.requestPermissions();
      if (!permissions.foreground) {
        console.log('Location permission not granted');
        return false;
      }

      // Start foreground tracking
      const started = await LocationService.startForegroundTracking((location) => {
        get().updateCurrentLocation(location);
      });

      if (started) {
        set({ isLocationTracking: true });

        // Start background tracking if we have permission
        if (permissions.background) {
          await LocationService.startBackgroundTracking();
        }
      }

      return started;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  },

  // Stop location tracking
  stopLocationTracking: async () => {
    try {
      await LocationService.stopForegroundTracking();
      await LocationService.stopBackgroundTracking();
      set({ isLocationTracking: false });
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  },
}));
