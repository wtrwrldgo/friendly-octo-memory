/**
 * Yandex MapKit Configuration for Driver App
 */

import Constants from 'expo-constants';

export const YANDEX_MAPKIT_KEY =
  Constants.expoConfig?.extra?.yandexMapkitKey ||
  process.env.EXPO_PUBLIC_YANDEX_MAPKIT_KEY ||
  '99c47a34-bfad-4945-a1ae-d0ee6bff4e0a';

/**
 * Default location - Nukus, Uzbekistan
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
  defaultZoom: 14,
  orderDetailZoom: 16,
  minZoom: 5,
  maxZoom: 20,
};
