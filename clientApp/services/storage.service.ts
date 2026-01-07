/**
 * Storage Service
 *
 * Handles persistent storage using SecureStore for sensitive data and AsyncStorage for non-sensitive data.
 * Manages authentication tokens and user preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage keys
// Note: SecureStore keys must only contain alphanumeric characters, ".", "-", and "_"
const STORAGE_KEYS = {
  AUTH_TOKEN: 'watergo_auth_token',
  REFRESH_TOKEN: 'watergo_refresh_token',
  USER_DATA: 'watergo_user_data',
  LANGUAGE: '@watergo_language',
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

  // Refresh token management (using SecureStore for security)
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

  // User data caching
  async setUserData(userData: object): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  async getUserData<T>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
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

  // Clear all data (logout)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // ============================================
  // Helper aliases for easier use
  // ============================================

  async setToken(token: string): Promise<void> {
    return this.setAuthToken(token);
  }

  async getToken(): Promise<string | null> {
    return this.getAuthToken();
  }

  async setUser(user: any): Promise<void> {
    return this.setUserData(user);
  }

  async getUser<T = any>(): Promise<T | null> {
    return this.getUserData<T>();
  }

  async clearAuth(): Promise<void> {
    await this.removeAuthToken();
    await this.removeRefreshToken();
    await this.removeUserData();
  }

  // ============================================
  // Generic storage methods (for any key-value)
  // ============================================

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
