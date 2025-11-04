/**
 * Geocoding TypeScript Types
 * Types for Yandex MapKit geocoding, reverse geocoding, and search
 */

/**
 * Geocoding API Response from Yandex
 */
export interface GeocodingResult {
  lat: number;
  lon: number;
  address: string;
  components?: {
    country?: string;
    province?: string;
    locality?: string;
    street?: string;
    house?: string;
  };
}

/**
 * Search suggestion item
 */
export interface SearchSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  lat: number;
  lon: number;
}

/**
 * Selected address state
 */
export interface SelectedAddress {
  lat: number;
  lon: number;
  address: string;
}

/**
 * Camera position for Yandex Map
 */
export interface CameraPosition {
  lat: number;
  lon: number;
  zoom: number;
}

/**
 * Location coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Yandex Geocoding API Response (raw)
 */
export interface YandexGeocodingResponse {
  response: {
    GeoObjectCollection: {
      featureMember: Array<{
        GeoObject: {
          metaDataProperty: {
            GeocoderMetaData: {
              Address: {
                formatted: string;
                Components?: Array<{
                  kind: string;
                  name: string;
                }>;
              };
            };
          };
          Point: {
            pos: string; // "lon lat"
          };
          description?: string;
        };
      }>;
    };
  };
}
