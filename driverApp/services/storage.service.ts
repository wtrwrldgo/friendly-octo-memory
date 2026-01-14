/**
 * Storage Service - Driver App
 *
 * Handles persistent storage using SecureStore for sensitive data and AsyncStorage for non-sensitive data.
 * Manages authentication tokens and driver preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'watergo_driver_auth_token',
  REFRESH_TOKEN: 'watergo_driver_refresh_token',
  DRIVER_DATA: 'watergo_driver_data',
  LANGUAGE: 'watergo_driver_language',
  ONLINE_STATUS: 'watergo_driver_online_status',
} as const;

class StorageService {
  // Authentication token management (using SecureStore for security)
  async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw error;
    }
  }

  // Refresh token management
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async removeRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error removing refresh token:', error);
      throw error;
    }
  }

  // Driver data caching
  async setDriverData(driverData: object): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_DATA, JSON.stringify(driverData));
    } catch (error) {
      console.error('Error saving driver data:', error);
      throw error;
    }
  }

  async getDriverData<T>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting driver data:', error);
      return null;
    }
  }

  async removeDriverData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.DRIVER_DATA);
    } catch (error) {
      console.error('Error removing driver data:', error);
      throw error;
    }
  }

  // Language preference
  async setLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Error saving language:', error);
      throw error;
    }
  }

  async getLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    } catch (error) {
      console.error('Error getting language:', error);
      return null;
    }
  }

  // Online status persistence
  async setOnlineStatus(isOnline: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONLINE_STATUS, JSON.stringify(isOnline));
    } catch (error) {
      console.error('Error saving online status:', error);
      throw error;
    }
  }

  async getOnlineStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.ONLINE_STATUS);
      return status ? JSON.parse(status) : false;
    } catch (error) {
      console.error('Error getting online status:', error);
      return false;
    }
  }

  // Clear all data (logout)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DRIVER_DATA,
        STORAGE_KEYS.LANGUAGE,
        STORAGE_KEYS.ONLINE_STATUS,
      ]);
      await this.removeAuthToken();
      await this.removeRefreshToken();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Helper aliases for easier use
  async setToken(token: string): Promise<void> {
    return this.setAuthToken(token);
  }

  async getToken(): Promise<string | null> {
    return this.getAuthToken();
  }

  async setDriver(driver: any): Promise<void> {
    return this.setDriverData(driver);
  }

  async getDriver<T = any>(): Promise<T | null> {
    return this.getDriverData<T>();
  }

  async clearAuth(): Promise<void> {
    await this.removeAuthToken();
    await this.removeRefreshToken();
    await this.removeDriverData();
  }

  // Generic storage methods
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving item ${key}:`, error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }
}

export default new StorageService();
