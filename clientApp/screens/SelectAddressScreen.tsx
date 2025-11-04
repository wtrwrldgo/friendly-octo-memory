import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { YaMap, Marker, CameraPosition } from 'react-native-yamap';
import * as Location from 'expo-location';
import { YANDEX_MAPKIT_KEY, DEFAULT_LOCATION } from '../config/mapkit.config';
import { Colors } from '../constants/Colors';
import { useUser } from '../context/UserContext';
import type {
  GeocodingResult,
  SearchSuggestion,
  SelectedAddress
} from '../types/geocoding.types';

export default function SelectAddressScreen() {
  const navigation = useNavigation<any>();
  const { addAddress, setSelectedAddress: setUserSelectedAddress, addresses } = useUser();

  // State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [localSelectedAddress, setLocalSelectedAddress] = useState<SelectedAddress | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
    lat: DEFAULT_LOCATION.latitude,
    lon: DEFAULT_LOCATION.longitude,
    zoom: DEFAULT_LOCATION.zoom,
  });

  // Refs
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Request location permission and center on user
  useEffect(() => {
    requestLocationPermission();
  }, []);

  /**
   * Request location permission and get user's current location
   */
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        // Get user's current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const userPosition: CameraPosition = {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
          zoom: 15,
        };

        setCameraPosition(userPosition);

        // Reverse geocode user's location
        reverseGeocode(location.coords.latitude, location.coords.longitude);
      } else {
        // Permission denied, use default location (Nukus, Uzbekistan)
        console.log('Location permission denied, using default location (Nukus)');
        reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      // Fallback to default location
      reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    }
  };

  /**
   * Handle map tap - drop pin and reverse geocode
   */
  const handleMapPress = (event: any) => {
    const { lat, lon } = event.nativeEvent;

    // Update camera position to tapped location
    setCameraPosition({
      lat,
      lon,
      zoom: cameraPosition.zoom,
    });

    // Reverse geocode the tapped location
    reverseGeocode(lat, lon);
  };

  /**
   * Reverse geocode: Convert coordinates to address
   * @param lat - Latitude
   * @param lon - Longitude
   */
  const reverseGeocode = async (lat: number, lon: number) => {
    setIsGeocoding(true);

    try {
      // Use OpenStreetMap Nominatim (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'WaterGo Mobile App'
          }
        }
      );

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
    } catch (error) {
      console.error('Reverse geocoding error:', error);

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
    // Update camera position
    const newPosition: CameraPosition = {
      lat: suggestion.lat,
      lon: suggestion.lon,
      zoom: 16,
    };

    setCameraPosition(newPosition);

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
  };

  /**
   * Handle "Use this address" button press
   */
  const handleUseAddress = () => {
    if (localSelectedAddress) {
      console.log('Selected Address:', localSelectedAddress);

      // If this is the first address (user has no addresses), make it default
      const isFirstAddress = addresses.length === 0;

      // Create new address object
      const newAddress = {
        id: Date.now().toString(),
        title: isFirstAddress ? 'Home' : 'New Address',
        address: localSelectedAddress.address,
        lat: localSelectedAddress.lat,
        lng: localSelectedAddress.lon,
        isDefault: isFirstAddress, // Make first address default
      };

      // Add to user's addresses
      addAddress(newAddress);

      // Set as selected address (important for first-time users!)
      setUserSelectedAddress(newAddress);

      // Navigate back
      navigation.goBack();
    } else {
      Alert.alert('No Address Selected', 'Please select an address on the map first.');
    }
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

  return (
    <View style={styles.container}>
      {/* Yandex Map */}
      <YaMap
        ref={mapRef}
        style={styles.map}
        onMapLoaded={() => setMapReady(true)}
        onMapPress={handleMapPress}
        initialRegion={{
          lat: cameraPosition.lat,
          lon: cameraPosition.lon,
          zoom: cameraPosition.zoom,
        }}
        camera={{
          center: {
            lat: cameraPosition.lat,
            lon: cameraPosition.lon,
          },
          zoom: cameraPosition.zoom,
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

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an address..."
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
            <Text style={styles.addressLoadingText}>Fetching address...</Text>
          </View>
        ) : localSelectedAddress ? (
          <>
            <View style={styles.selectedAddressContainer}>
              <Text style={styles.selectedAddressLabel}>Selected address:</Text>
              <Text style={styles.selectedAddressText} numberOfLines={2}>
                {localSelectedAddress.address}
              </Text>
              <Text style={styles.selectedAddressCoords}>
                {localSelectedAddress.lat.toFixed(6)}, {localSelectedAddress.lon.toFixed(6)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.useAddressButton}
              onPress={handleUseAddress}
            >
              <Text style={styles.useAddressButtonText}>Use this address</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.selectedAddressContainer}>
            <Text style={styles.selectedAddressLabel}>Tap on the map to select an address</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
    marginBottom: 16,
  },
  selectedAddressLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
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
  useAddressButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
