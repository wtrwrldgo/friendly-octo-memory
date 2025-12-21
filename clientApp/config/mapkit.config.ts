/**
 * Yandex MapKit Configuration
 */

import Constants from 'expo-constants';

export const YANDEX_MAPKIT_KEY =
  Constants.expoConfig?.extra?.yandexMapkitKey ||
  process.env.EXPO_PUBLIC_YANDEX_MAPKIT_KEY ||
  '99c47a34-bfad-4945-a1ae-d0ee6bff4e0a'; // Fallback to .env value

/**
 * Default location - Nukus, Uzbekistan
 * Used when user denies location permission
 */
export const DEFAULT_LOCATION = {
  latitude: 42.4531,
  longitude: 59.6103,
  zoom: 12,
};

/**
 * Map Configuration
 */
export const MAP_CONFIG = {
  defaultZoom: 12,
  searchZoom: 16,
  minZoom: 5,
  maxZoom: 20,
};

/**
 * Geocoding Configuration
 */
export const GEOCODING_CONFIG = {
  apiUrl: 'https://geocode-maps.yandex.ru/1.x/',
  language: 'en',
  maxResults: 5,
  minQueryLength: 3,
  debounceMs: 500,
};
