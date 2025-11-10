import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { YaMap, Marker } from 'react-native-yamap';

interface CameraPosition {
  lat: number;
  lon: number;
  zoom: number;
}
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '../config/mapkit.config';
import { Colors } from '../constants/Colors';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import type {
  SearchSuggestion,
  SelectedAddress
} from '../types/geocoding.types';

export default function SelectAddressScreen() {
  const navigation = useNavigation<any>();
  const { addresses, user } = useUser();
  const { t } = useLanguage();

  // State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [localSelectedAddress, setLocalSelectedAddress] = useState<SelectedAddress | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [, setMapReady] = useState<boolean>(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
    lat: DEFAULT_LOCATION.latitude,
    lon: DEFAULT_LOCATION.longitude,
    zoom: DEFAULT_LOCATION.zoom,
  });

  // Refs
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial map position on mount
  useEffect(() => {
    // When map is ready, set camera to default location (Nukus)
    const timer = setTimeout(() => {
      if (mapRef.current) {
        // Use requestAnimationFrame to ensure UI updates on main thread
        requestAnimationFrame(() => {
          mapRef.current?.setCenter(
            { lat: DEFAULT_LOCATION.latitude, lon: DEFAULT_LOCATION.longitude },
            DEFAULT_LOCATION.zoom,
            0,  // azimuth
            0,  // tilt
            0   // no animation on initial load
          );
          console.log('✅ Map initialized at default location (Nukus)');
        });
      }
    }, 500); // Small delay to ensure map is ready

    return () => clearTimeout(timer);
  }, []);

  // Disable back navigation during signup flow to keep flow clean
  // But allow it when user is already authenticated (adding additional address)
  useEffect(() => {
    const isSignupFlow = addresses.length === 0 && !user?.id;
    navigation.setOptions({
      gestureEnabled: !isSignupFlow,
      headerBackVisible: !isSignupFlow,
    });
  }, [navigation, addresses.length, user?.id]);

  /**
   * Request location permission and get user's current location
   */
  const requestLocationPermission = async () => {
    if (isFetchingLocation) {
      console.log('Already fetching location, please wait...');
      return;
    }

    setIsFetchingLocation(true);
    // Clear any existing address before fetching new location
    setLocalSelectedAddress(null);
    console.log('🌍 GPS button clicked - Requesting location...');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Location permission status:', status);

      if (status === 'granted') {
        console.log('✅ Permission granted! Getting current position...');

        // Get user's current location with BALANCED accuracy
        // Always fetch fresh location to avoid showing old cached addresses
        console.log('📡 Fetching current location...');
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Balanced for faster response
        });
        console.log('✅ Got current location:', location.coords.latitude, location.coords.longitude);

        const userPosition: CameraPosition = {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
          zoom: 16,
        };

        // Update camera position state
        setCameraPosition(userPosition);

        // Animate map to user's location using ref
        if (mapRef.current) {
          // Ensure UI update happens on main thread
          requestAnimationFrame(() => {
            mapRef.current?.setCenter(
              { lat: location.coords.latitude, lon: location.coords.longitude },
              16, // zoom
              0,  // azimuth
              0,  // tilt
              1000, // duration (1 second animation)
            );
            console.log('✅ Camera animated to user location');
          });
        } else {
          console.log('⚠️ Map ref not available, camera not moved');
        }

        // Reverse geocode user's location
        await reverseGeocode(location.coords.latitude, location.coords.longitude);
      } else {
        // Permission denied, use default location (Nukus, Uzbekistan)
        console.log('❌ Location permission denied, using default location (Nukus)');
        Alert.alert(
          t('auth.locationPermissionDenied') || 'Location Permission Denied',
          t('auth.locationPermissionMessage') || 'Please enable location permission to use this feature.'
        );
        reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      }
    } catch (error) {
      console.error('❌ Error requesting location permission:', error);
      Alert.alert(
        t('auth.error') || 'Error',
        t('auth.locationError') || 'Failed to get your location. Please try again.'
      );
      // Fallback to default location
      reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    } finally {
      setIsFetchingLocation(false);
      console.log('🏁 Location fetch complete');
    }
  };

  /**
   * Handle map tap - drop pin and reverse geocode
   */
  const handleMapPress = (event: any) => {
    const { lat, lon } = event.nativeEvent;

    // Ensure map updates happen on main thread
    requestAnimationFrame(() => {
      // Update camera position to tapped location
      setCameraPosition({
        lat,
        lon,
        zoom: cameraPosition.zoom,
      });

      // Reverse geocode the tapped location
      reverseGeocode(lat, lon);
    });
  };

  /**
   * Reverse geocode: Convert coordinates to address
   * @param lat - Latitude
   * @param lon - Longitude
   */
  const reverseGeocode = async (lat: number, lon: number) => {
    setIsGeocoding(true);

    try {
      // Use OpenStreetMap Nominatim with timeout for faster response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'WaterGo Mobile App'
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data && data.display_name) {
        // Format address from OSM data
        const addr = data.address || {};
        let addressParts = [];

        // Build address: Street + House, City, Country
        if (addr.road) {
          let street = addr.road;
          if (addr.house_number) street = `${addr.house_number} ${street}`;
          addressParts.push(street);
        }

        if (addr.city || addr.town || addr.village) {
          addressParts.push(addr.city || addr.town || addr.village);
        }

        if (addr.state) addressParts.push(addr.state);
        if (addr.country) addressParts.push(addr.country);

        const formattedAddress = addressParts.length > 0
          ? addressParts.join(', ')
          : data.display_name;

        setLocalSelectedAddress({
          lat,
          lon,
          address: formattedAddress,
        });
        return;
      }

      // Fallback: use coordinates as address
      console.log('No address found, using coordinates');
      setLocalSelectedAddress({
        lat,
        lon,
        address: `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('⏱️ Reverse geocoding timeout - using coordinates');
      } else {
        console.error('Reverse geocoding error:', error);
      }

      // Fallback: use coordinates as address
      setLocalSelectedAddress({
        lat,
        lon,
        address: `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  /**
   * Forward geocode: Search for address by text query
   * @param query - Search query text
   */
  const searchAddress = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);

    try {
      // Use OpenStreetMap Nominatim search (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&accept-language=en`,
        {
          headers: {
            'User-Agent': 'WaterGo Mobile App'
          }
        }
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const results: SearchSuggestion[] = data.map((item: any, index: number) => {
          // Format address from OSM data
          const addr = item.address || {};
          let addressParts = [];

          if (addr.road) {
            let street = addr.road;
            if (addr.house_number) street = `${addr.house_number} ${street}`;
            addressParts.push(street);
          }

          if (addr.city || addr.town || addr.village) {
            addressParts.push(addr.city || addr.town || addr.village);
          }

          if (addr.country) addressParts.push(addr.country);

          const title = addressParts.length > 0
            ? addressParts.join(', ')
            : item.display_name;

          const subtitle = item.type ? `${item.type}` : '';

          return {
            id: `${index}`,
            title: title,
            subtitle: subtitle,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          };
        });

        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Forward geocoding error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handle search input change with debouncing
   */
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search (wait 500ms after user stops typing)
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(text);
    }, 500);
  };

  /**
   * Handle suggestion tap - move map to location
   */
  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    // Ensure map updates happen on main thread
    requestAnimationFrame(() => {
      // Update camera position
      const newPosition: CameraPosition = {
        lat: suggestion.lat,
        lon: suggestion.lon,
        zoom: 16,
      };

      setCameraPosition(newPosition);

      // Animate map to location
      if (mapRef.current) {
        mapRef.current?.setCenter(
          { lat: suggestion.lat, lon: suggestion.lon },
          16,
          0,
          0,
          500
        );
      }

      // Update selected address
      setLocalSelectedAddress({
        lat: suggestion.lat,
        lon: suggestion.lon,
        address: suggestion.title,
      });

      // Clear search
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    });
  };

  /**
   * Handle "Use this address" button press
   * Navigate to AddressTypeScreen to select building type
   */
  const handleUseAddress = () => {
    if (!localSelectedAddress) {
      Alert.alert(t('auth.noAddressSelected'), t('auth.noAddressSelectedMessage'));
      return;
    }

    console.log('=== SelectAddressScreen: Use Address Clicked ===');
    console.log('Local Selected Address:', localSelectedAddress);
    console.log('Navigating to AddressTypeScreen...');

    // Prepare address data to pass to next screen
    const addressData = {
      address: localSelectedAddress.address,
      lat: localSelectedAddress.lat,
      lng: localSelectedAddress.lon,
      isFirstAddress: addresses.length === 0,
    };

    // Navigate to AddressTypeScreen to select building type
    navigation.navigate('AddressType', { addressData });
  };

  /**
   * Render search suggestion item
   */
  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionTitle} numberOfLines={1}>
        {item.title}
      </Text>
      {item.subtitle ? (
        <Text style={styles.suggestionSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  // Check if user is authenticated (not in signup flow)
  const isAuthenticated = addresses.length > 0 || user?.id;

  // Handle cancel button press (for authenticated users only)
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Cancel Button (only show when authenticated) */}
      {isAuthenticated && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>✕</Text>
        </TouchableOpacity>
      )}

      {/* Yandex Map */}
      <YaMap
        ref={mapRef}
        style={styles.map}
        showUserPosition={false}
        nightMode={false}
        onMapLoaded={() => {
          console.log('✅ Map loaded successfully!');
          console.log('📍 Setting initial location:', DEFAULT_LOCATION);
          setMapReady(true);
          // Set camera position immediately after map loads
          if (mapRef.current) {
            // Ensure UI update happens on main thread
            requestAnimationFrame(() => {
              mapRef.current?.setCenter(
                { lat: DEFAULT_LOCATION.latitude, lon: DEFAULT_LOCATION.longitude },
                DEFAULT_LOCATION.zoom,
                0,
                0,
                500
              );
            });
          }
        }}
        onCameraPositionChange={() => {
          console.log('🎥 Camera position changed');
        }}
        onMapPress={handleMapPress}
        initialRegion={{
          lat: DEFAULT_LOCATION.latitude,
          lon: DEFAULT_LOCATION.longitude,
          zoom: DEFAULT_LOCATION.zoom,
        }}
      >
        {/* Pin Marker */}
        {localSelectedAddress && (
          <Marker
            point={{
              lat: localSelectedAddress.lat,
              lon: localSelectedAddress.lon,
            }}
            source={require('../assets/pin.png')}
            scale={1.5}
            anchor={{ x: 0.5, y: 1 }}
          />
        )}
      </YaMap>

      {/* GPS Auto-Find Location Button */}
      <TouchableOpacity
        style={[styles.gpsButton, isFetchingLocation && styles.gpsButtonActive]}
        onPress={requestLocationPermission}
        activeOpacity={0.8}
        disabled={isFetchingLocation}
      >
        {isFetchingLocation ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.gpsIcon}>🧭</Text>
        )}
      </TouchableOpacity>

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('auth.searchAddressPlaceholder')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={styles.searchLoader}
            />
          )}
        </View>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.suggestionsList}
            />
          </View>
        )}
      </View>

      {/* Selected Address Display */}
      <View style={styles.bottomContainer}>
        {isGeocoding ? (
          <View style={styles.addressLoading}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.addressLoadingText}>{t('auth.fetchingAddress')}</Text>
          </View>
        ) : localSelectedAddress ? (
          <>
            <View style={styles.selectedAddressContainer}>
              <Text style={styles.selectedAddressLabel}>{t('auth.selectedAddress')}</Text>
              <Text style={styles.selectedAddressText} numberOfLines={2}>
                {localSelectedAddress.address}
              </Text>
              <Text style={styles.selectedAddressCoords}>
                {t('auth.locationLabel')} {localSelectedAddress.lat.toFixed(6)}, {localSelectedAddress.lon.toFixed(6)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.useAddressButton}
              onPress={handleUseAddress}
            >
              <Text style={styles.useAddressButtonText}>{t('auth.useThisAddress')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.selectedAddressContainer}>
            <View style={styles.emptyStateRow}>
              <Image
                source={require('../assets/mascot/water-drop-mascot.png')}
                style={styles.mascotImage}
                resizeMode="contain"
              />
              <View style={styles.emptyStateTextContainer}>
                <Text style={styles.emptyStateTitle}>{t('auth.noLocationSelected')}</Text>
                <Text style={styles.emptyStateText}>
                  {t('auth.tapGPSButton')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray,
  },
  map: {
    flex: 1,
  },

  // GPS Button
  gpsButton: {
    position: 'absolute',
    bottom: 280,
    right: 16,
    zIndex: 15,
    backgroundColor: Colors.white,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gpsButtonActive: {
    backgroundColor: Colors.primary,
  },
  gpsIcon: {
    fontSize: 28,
  },

  // Search Container
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchInputWrapper: {
    backgroundColor: Colors.gray,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 0,
  },
  searchLoader: {
    marginLeft: 8,
  },

  // Suggestions
  suggestionsContainer: {
    backgroundColor: Colors.gray,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionsList: {
    borderRadius: 12,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionTitle: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },

  // Bottom Container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.gray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  // Address Loading
  addressLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  addressLoadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },

  // Selected Address
  selectedAddressContainer: {
    marginBottom: 4,
  },
  selectedAddressLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  emptyStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascotImage: {
    width: 140,
    height: 140,
    flexShrink: 0,
  },
  emptyStateTextContainer: {
    flex: 1,
  },
  emptyStateIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  selectedAddressText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedAddressCoords: {
    fontSize: 12,
    color: '#999',
  },

  // Use Address Button
  useAddressButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useAddressButtonDisabled: {
    backgroundColor: '#B0C4DE',
    opacity: 0.7,
  },
  useAddressButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Cancel Button
  cancelButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 16,
    zIndex: 20,
    backgroundColor: Colors.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: '600',
  },
});
