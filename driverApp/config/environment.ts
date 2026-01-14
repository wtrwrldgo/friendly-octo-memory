/**
 * Environment Configuration
 * Centralized environment management for dev/staging/production
 *
 * @module config/environment
 * @description Manages environment-specific configuration across development, staging, and production
 * @example
 * ```typescript
 * import ENV_CONFIG, { IS_DEV, logDev } from './config/environment';
 *
 * if (ENV_CONFIG.useMockData) {
 *   logDev('Using mock data');
 * }
 * ```
 */

import { Platform } from 'react-native';

// Helper: safely parse boolean env values
const parseBoolean = (value: any, defaultValue: boolean): boolean => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return defaultValue;
};

/**
 * Application environment types
 * @typedef {'development' | 'staging' | 'production'} Environment
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Get the correct localhost URL based on platform
 * - iOS Simulator: localhost works
 * - Android Emulator: 10.0.2.2 (special alias for host machine)
 */
const getLocalBackendUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api'; // Android emulator
  }
  return 'http://localhost:3001/api'; // iOS simulator
};

/**
 * Environment configuration interface
 * @interface EnvironmentConfig
 * @property {Environment} env - Current environment (development/staging/production)
 * @property {boolean} useMockData - Whether to use mock data instead of real API
 * @property {boolean} enableLogging - Whether to enable console logging
 * @property {string} apiUrl - API base URL for current environment
 * @property {string} [sentryDSN] - Sentry DSN for crash reporting (optional)
 * @property {boolean} enableAnalytics - Whether to enable analytics tracking
 */
export interface EnvironmentConfig {
  env: Environment;
  useMockData: boolean;
  useLocalBackend: boolean;
  enableLogging: boolean;
  apiUrl: string;
  sentryDSN?: string;
  enableAnalytics: boolean;
}

// Determine current environment
const getCurrentEnvironment = (): Environment => {
  // In Expo, check __DEV__ flag
  if (__DEV__) {
    return 'development';
  }

  // Check environment variable if available
  const envVar = process.env.EXPO_PUBLIC_ENVIRONMENT as Environment;
  if (envVar && ['development', 'staging', 'production'].includes(envVar)) {
    return envVar;
  }

  // Default to production for safety
  return 'production';
};

// Flags from env (with sensible defaults)
const CURRENT_ENV = getCurrentEnvironment();
const USE_MOCK_DATA = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_DATA, false);
const USE_LOCAL_BACKEND = parseBoolean(process.env.EXPO_PUBLIC_USE_LOCAL_BACKEND, false);
const ENABLE_LOGGING = parseBoolean(process.env.EXPO_PUBLIC_DEBUG_MODE, CURRENT_ENV !== 'production');
const ENABLE_ANALYTICS = parseBoolean(process.env.EXPO_PUBLIC_ENABLE_ANALYTICS, CURRENT_ENV !== 'development');

// API URLs from env - Using 127.0.0.1 with ADB reverse port forwarding
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
const STAGING_API_URL = process.env.EXPO_PUBLIC_STAGING_API_URL;
const DEV_API_URL = process.env.EXPO_PUBLIC_DEV_API_URL || 'http://127.0.0.1:3001/api';

// Environment-specific configurations
const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    env: 'development',
    useMockData: USE_MOCK_DATA,
    useLocalBackend: USE_LOCAL_BACKEND,
    enableLogging: ENABLE_LOGGING,
    apiUrl:
      (USE_LOCAL_BACKEND && (DEV_API_URL || getLocalBackendUrl())) ||
      API_URL ||
      STAGING_API_URL ||
      getLocalBackendUrl(),
    enableAnalytics: ENABLE_ANALYTICS,
  },
  staging: {
    env: 'staging',
    useMockData: USE_MOCK_DATA,
    useLocalBackend: USE_LOCAL_BACKEND,
    enableLogging: ENABLE_LOGGING,
    apiUrl: STAGING_API_URL || API_URL || 'https://api.watergocrm.uz/api',
    sentryDSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableAnalytics: ENABLE_ANALYTICS,
  },
  production: {
    env: 'production',
    useMockData: USE_MOCK_DATA,
    useLocalBackend: USE_LOCAL_BACKEND,
    enableLogging: ENABLE_LOGGING,
    apiUrl: USE_LOCAL_BACKEND ? (DEV_API_URL || API_URL || 'https://api.watergocrm.uz/api') : (API_URL || 'https://api.watergocrm.uz/api'),
    sentryDSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableAnalytics: ENABLE_ANALYTICS,
  },
};

// Get current environment config
export const ENV_CONFIG: EnvironmentConfig = environments[CURRENT_ENV];

// Convenience flags
export const IS_DEV = ENV_CONFIG.env === 'development';
export const IS_STAGING = ENV_CONFIG.env === 'staging';
export const IS_PROD = ENV_CONFIG.env === 'production';

/**
 * Development logging helper
 * Only logs when logging is enabled in environment config
 * @param {...any} args - Arguments to log
 * @example
 * ```typescript
 * logDev('User logged in:', userId);
 * ```
 */
export const logDev = (...args: any[]) => {
  if (ENV_CONFIG.enableLogging) {
    console.log('[DEV]', ...args);
  }
};

/**
 * Error logging helper
 * Only logs when logging is enabled in environment config
 * @param {...any} args - Arguments to log as errors
 * @example
 * ```typescript
 * logError('Failed to fetch data:', error);
 * ```
 */
export const logError = (...args: any[]) => {
  if (ENV_CONFIG.enableLogging) {
    console.error('[ERROR]', ...args);
  }
};

// Export current environment
export default ENV_CONFIG;
