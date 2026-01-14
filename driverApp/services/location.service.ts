/**
 * Location Service - Driver App
 * Handles foreground and background location tracking
 */

import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Check if native modules are available
const isLocationAvailable = (): boolean => {
  try {
    return !!(Location && TaskManager);
  } catch {
    return false;
  }
};

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

class LocationService {
  private static instance: LocationService;
  private isTracking: boolean = false;
  private foregroundSubscription: Location.LocationSubscription | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
  }> {
    if (!isLocationAvailable()) {
      console.log('[LocationService] Location module not available');
      return { foreground: false, background: false };
    }

    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return { foreground: false, background: false };
      }

      // Request background permission (only on supported platforms)
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

        return {
          foreground: true,
          background: backgroundStatus === 'granted',
        };
      }

      return { foreground: true, background: false };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return { foreground: false, background: false };
    }
  }

  /**
   * Check current permissions status
   */
  async checkPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
  }> {
    if (!isLocationAvailable()) {
      return { foreground: false, background: false };
    }

    try {
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();

      return {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted',
      };
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return { foreground: false, background: false };
    }
  }

  /**
   * Get current location (one-time)
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    if (!isLocationAvailable()) {
      return null;
    }

    try {
      const permissions = await this.checkPermissions();
      if (!permissions.foreground) {
        console.log('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return this.formatLocationData(location);
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start foreground location tracking
   */
  async startForegroundTracking(
    onLocationUpdate: (location: LocationData) => void
  ): Promise<boolean> {
    if (!isLocationAvailable()) {
      console.log('[LocationService] Cannot start tracking - Location module not available');
      return false;
    }

    try {
      if (this.isTracking) {
        console.log('Foreground tracking already active');
        return true;
      }

      const permissions = await this.checkPermissions();
      if (!permissions.foreground) {
        console.log('Location permission not granted');
        return false;
      }

      this.foregroundSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // or every 50 meters
        },
        (location) => {
          const formattedLocation = this.formatLocationData(location);
          onLocationUpdate(formattedLocation);
        }
      );

      this.isTracking = true;
      console.log('Foreground location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting foreground tracking:', error);
      return false;
    }
  }

  /**
   * Stop foreground location tracking
   */
  async stopForegroundTracking(): Promise<void> {
    try {
      if (this.foregroundSubscription) {
        this.foregroundSubscription.remove();
        this.foregroundSubscription = null;
      }
      this.isTracking = false;
      console.log('Foreground location tracking stopped');
    } catch (error) {
      console.error('Error stopping foreground tracking:', error);
    }
  }

  /**
   * Start background location tracking
   */
  async startBackgroundTracking(): Promise<boolean> {
    if (!isLocationAvailable()) {
      console.log('[LocationService] Cannot start background tracking - Native modules not available');
      return false;
    }

    try {
      const permissions = await this.checkPermissions();
      if (!permissions.background) {
        console.log('Background location permission not granted');
        return false;
      }

      // Check if task is already defined
      const isTaskDefined = await TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
      if (!isTaskDefined) {
        console.log('Background location task not defined');
        return false;
      }

      // Start background location updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // Update every 30 seconds in background
        distanceInterval: 100, // or every 100 meters
        foregroundService: {
          notificationTitle: 'WaterGo Driver',
          notificationBody: 'Tracking your location for active deliveries',
          notificationColor: '#FF6B35',
        },
        showsBackgroundLocationIndicator: true,
      });

      console.log('Background location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting background tracking:', error);
      return false;
    }
  }

  /**
   * Stop background location tracking
   */
  async stopBackgroundTracking(): Promise<void> {
    if (!isLocationAvailable()) {
      return;
    }

    try {
      const isStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );

      if (isStarted) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log('Background location tracking stopped');
      }
    } catch (error) {
      console.error('Error stopping background tracking:', error);
    }
  }

  /**
   * Check if foreground tracking is active
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Check if background tracking is active
   */
  async isBackgroundTrackingActive(): Promise<boolean> {
    if (!isLocationAvailable()) {
      return false;
    }

    try {
      return await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    } catch (error) {
      console.error('Error checking background tracking status:', error);
      return false;
    }
  }

  /**
   * Format location data to our standard format
   */
  private formatLocationData(location: Location.LocationObject): LocationData {
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      heading: location.coords.heading,
      speed: location.coords.speed,
      timestamp: location.timestamp,
    };
  }
}

export default LocationService.getInstance();
