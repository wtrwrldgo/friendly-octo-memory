/**
 * Yandex MapKit Configuration
 */

export const YANDEX_MAPKIT_KEY = '34c20e7b-cade-43bd-a252-fea9b47389e6';

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
