import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { YaMap, Marker, Circle, Animation } from 'react-native-yamap';
import { MapFallbackUI } from '../components/MapFallbackUI';

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
import { useToast } from '../context/ToastContext';
import type {
  SearchSuggestion,
  SelectedAddress
} from '../types/geocoding.types';

export default function SelectAddressScreen() {
  const navigation = useNavigation<any>();
  const { addresses, user } = useUser();
  const { t } = useLanguage();
  const { showError } = useToast();
  const insets = useSafeAreaInsets();

  // State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [localSelectedAddress, setLocalSelectedAddress] = useState<SelectedAddress | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
  const [showFallback, setShowFallback] = useState<boolean>(false);

  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
    lat: DEFAULT_LOCATION.latitude,
    lon: DEFAULT_LOCATION.longitude,
    zoom: DEFAULT_LOCATION.zoom,
  });

  // Refs
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef<boolean>(false); // Lock to prevent camera position updates during animation

  // Map loading timeout - show fallback if map doesn't load within 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapReady) {
        console.log('📍 Map loading timeout - showing fallback UI');
        setShowFallback(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [mapReady]);

  // Set initial map position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        requestAnimationFrame(() => {
          try {
            mapRef.current?.setCenter(
              { lat: DEFAULT_LOCATION.latitude, lon: DEFAULT_LOCATION.longitude },
              DEFAULT_LOCATION.zoom,
              0,
              0,
              0
            );
          } catch (error) {
            console.error('Error calling setCenter:', error);
            setShowFallback(true);
          }
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Disable back navigation during signup flow
  useEffect(() => {
    const isSignupFlow = addresses.length === 0 && !user?.id;
    navigation.setOptions({
      gestureEnabled: !isSignupFlow,
      headerBackVisible: !isSignupFlow,
    });
  }, [navigation, addresses.length, user?.id]);

  const requestLocationPermission = async () => {
    if (isFetchingLocation) return;

    setIsFetchingLocation(true);
    setLocalSelectedAddress(null);

    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        showError(t('auth.locationPermissionDenied') || 'Location permission denied. Using default location.');
        // Fall back to default location
        const defaultPosition: CameraPosition = {
          lat: DEFAULT_LOCATION.latitude,
          lon: DEFAULT_LOCATION.longitude,
          zoom: 18,
        };
        setCameraPosition(defaultPosition);

        // Lock camera updates during animation
        isAnimatingRef.current = true;

        if (mapRef.current) {
          mapRef.current.setCenter(
            { lat: DEFAULT_LOCATION.latitude, lon: DEFAULT_LOCATION.longitude },
            18,    // zoom
            0,     // azimuth
            0,     // tilt
            500,   // duration in ms
            Animation.SMOOTH
          );

          // Release lock after animation completes
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 600);
        } else {
          isAnimatingRef.current = false;
        }

        await reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        return;
      }

      // Get actual GPS location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      const userPosition: CameraPosition = {
        lat: latitude,
        lon: longitude,
        zoom: 18,
      };

      setCameraPosition(userPosition);

      if (mapRef.current) {
        // Lock camera updates during animation
        isAnimatingRef.current = true;

        console.log('📍 GPS: Calling setCenter with zoom 18...');
        try {
          mapRef.current.setCenter(
            { lat: latitude, lon: longitude },
            18,    // zoom
            0,     // azimuth
            0,     // tilt
            500,   // duration in ms
            Animation.SMOOTH
          );
          console.log('📍 GPS: setCenter called successfully');
        } catch (e) {
          console.log('📍 GPS: setCenter error:', e);
        }

        // Release lock after animation completes
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 600);
      }

      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      showError(t('auth.locationError') || 'Failed to get your location.');
      // Fall back to default location on error
      reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { lat, lon } = event.nativeEvent;
    Keyboard.dismiss();

    requestAnimationFrame(() => {
      setCameraPosition({
        lat,
        lon,
        zoom: cameraPosition.zoom,
      });
      reverseGeocode(lat, lon);
    });
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    setIsGeocoding(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`,
        {
          headers: { 'User-Agent': 'WaterGo Mobile App' },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data && data.display_name) {
        const addr = data.address || {};
        let addressParts = [];

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

        setLocalSelectedAddress({ lat, lon, address: formattedAddress });
        return;
      }

      setLocalSelectedAddress({
        lat,
        lon,
        address: `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      });
    } catch (error: any) {
      setLocalSelectedAddress({
        lat,
        lon,
        address: `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const searchAddress = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);

    try {
      // Add regional bias for Uzbekistan (viewbox: minLon, maxLat, maxLon, minLat)
      // Uzbekistan bounding box approximately: 55.9, 45.6, 73.1, 37.2
      const viewbox = '55.9,45.6,73.1,37.2';
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&accept-language=en&viewbox=${viewbox}&bounded=0&countrycodes=uz`;

      const response = await fetch(
        searchUrl,
        { headers: { 'User-Agent': 'WaterGo Mobile App' } }
      );

      let data = await response.json();

      // If no results with country restriction, try global search
      if (!Array.isArray(data) || data.length === 0) {
        const globalSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&accept-language=en`;
        const globalResponse = await fetch(
          globalSearchUrl,
          { headers: { 'User-Agent': 'WaterGo Mobile App' } }
        );
        data = await globalResponse.json();
      }

      if (Array.isArray(data) && data.length > 0) {
        const results: SearchSuggestion[] = data.map((item: any, index: number) => {
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

          const title = addressParts.length > 0 ? addressParts.join(', ') : item.display_name;

          return {
            id: `${index}`,
            title: title,
            subtitle: item.type || '',
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

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(text);
    }, 500);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    Keyboard.dismiss();

    const newPosition: CameraPosition = {
      lat: suggestion.lat,
      lon: suggestion.lon,
      zoom: 18,
    };

    setCameraPosition(newPosition);

    // Lock camera updates during animation
    isAnimatingRef.current = true;

    console.log('📍 handleSuggestionPress called:', { lat: suggestion.lat, lon: suggestion.lon });
    console.log('📍 mapRef.current exists:', !!mapRef.current);

    if (mapRef.current) {
      console.log('📍 Calling setCenter with zoom 18...');
      try {
        // Use fitMarkers for more reliable camera control
        mapRef.current.fitMarkers([{ lat: suggestion.lat, lon: suggestion.lon }]);

        // Then set zoom after a short delay
        setTimeout(() => {
          if (mapRef.current) {
            console.log('📍 Setting zoom to 17...');
            mapRef.current.setZoom(17, 0.5, Animation.SMOOTH);
          }
        }, 300);

        console.log('📍 fitMarkers called successfully');
      } catch (e) {
        console.log('📍 setCenter error:', e);
      }

      // Release lock after animation completes
      setTimeout(() => {
        isAnimatingRef.current = false;
        console.log('📍 Animation lock released');

        // Debug: Check actual camera position
        if (mapRef.current) {
          mapRef.current.getCameraPosition((pos: any) => {
            console.log('📍 Actual camera position after animation:', pos);
          });
        }
      }, 1000);
    } else {
      console.log('📍 mapRef.current is null!');
      isAnimatingRef.current = false;
    }

    setLocalSelectedAddress({
      lat: suggestion.lat,
      lon: suggestion.lon,
      address: suggestion.title,
    });

    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleUseAddress = () => {
    if (!localSelectedAddress) {
      showError(t('auth.noAddressSelectedMessage'));
      return;
    }

    const addressData = {
      address: localSelectedAddress.address,
      lat: localSelectedAddress.lat,
      lng: localSelectedAddress.lon,
      isFirstAddress: addresses.length === 0,
    };

    navigation.navigate('AddressType', { addressData });
  };

  const renderSuggestion = ({ item, index }: { item: SearchSuggestion; index: number }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        index === suggestions.length - 1 && styles.suggestionItemLast
      ]}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionIcon}>
        <Image
          source={require('../assets/ui-icons/address-icon.png')}
          style={styles.suggestionPinIcon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <View style={styles.suggestionBadge}>
            <Text style={styles.suggestionBadgeText}>
              {item.subtitle}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.suggestionArrow}>
        <Text style={styles.suggestionArrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const isAuthenticated = addresses.length > 0 || user?.id;

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleFallbackAddress = (address: string, lat?: number, lon?: number) => {
    const addressData = {
      address,
      lat: lat || DEFAULT_LOCATION.latitude,
      lng: lon || DEFAULT_LOCATION.longitude,
      isFirstAddress: addresses.length === 0,
    };
    navigation.navigate('AddressType', { addressData });
  };

  const handleRetryMap = () => {
    setShowFallback(false);
    setMapReady(false);
  };

  if (showFallback) {
    return (
      <View style={styles.container}>
        {isAuthenticated && (
          <TouchableOpacity style={styles.backButton} onPress={handleCancel} activeOpacity={0.8}>
            <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color="#1E293B" />
          </TouchableOpacity>
        )}
        <MapFallbackUI
          onAddressSelected={handleFallbackAddress}
          onRetry={handleRetryMap}
          placeholder={t('auth.enterAddressManually') || 'Enter your full address'}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <YaMap
        ref={mapRef}
        style={styles.map}
        showUserPosition={true}
        nightMode={false}
        zoomGesturesEnabled={true}
        scrollGesturesEnabled={true}
        tiltGesturesEnabled={false}
        rotateGesturesEnabled={false}
        fastTapEnabled={false}
        initialRegion={{
          lat: DEFAULT_LOCATION.latitude,
          lon: DEFAULT_LOCATION.longitude,
          zoom: DEFAULT_LOCATION.zoom,
        }}
        onMapLoaded={() => {
          setMapReady(true);
          if (mapRef.current) {
            setTimeout(() => {
              mapRef.current?.setCenter(
                { lat: DEFAULT_LOCATION.latitude, lon: DEFAULT_LOCATION.longitude },
                DEFAULT_LOCATION.zoom,
                0,
                0,
                100
              );
            }, 300);
          }
        }}
        onCameraPositionChange={(event: any) => {
          // Skip state updates during programmatic animation to prevent conflicts
          if (isAnimatingRef.current) return;

          if (event?.nativeEvent) {
            const { lat, lon, zoom } = event.nativeEvent;
            if (lat && lon && zoom !== undefined) {
              setCameraPosition({ lat, lon, zoom });
            }
          }
        }}
        onMapPress={handleMapPress}
      >
        {localSelectedAddress && (
          <>
            {/* Circle highlight around selected location */}
            <Circle
              center={{ lat: localSelectedAddress.lat, lon: localSelectedAddress.lon }}
              radius={20}
              fillColor="rgba(59, 130, 246, 0.15)"
              strokeColor="rgba(59, 130, 246, 0.5)"
              strokeWidth={2}
            />
            {/* Location marker pin */}
            <Marker
              point={{ lat: localSelectedAddress.lat, lon: localSelectedAddress.lon }}
              source={require('../assets/ui-icons/blue-pin.png')}
              scale={0.5}
              anchor={{ x: 0.5, y: 1 }}
            />
          </>
        )}
      </YaMap>

      {/* Header with Search */}
      <SafeAreaView style={styles.header} edges={['top']} pointerEvents="box-none">
        <View style={styles.headerContent} pointerEvents="box-none">
          {isAuthenticated && (
            <TouchableOpacity style={styles.backButton} onPress={handleCancel} activeOpacity={0.8}>
              <Ionicons
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                size={24}
                color="#1E293B"
              />
            </TouchableOpacity>
          )}

          <View style={[styles.searchContainer, !isAuthenticated && styles.searchContainerFull]}>
            <Image
              source={require('../assets/ui-icons/search-icon.png')}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('auth.searchAddressPlaceholder') || 'Search address...'}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCorrect={false}
              autoCapitalize="words"
            />
            {isSearching && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>
        </View>

        {/* Suggestions */}
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
      </SafeAreaView>

      {/* Map Controls */}
      <View style={styles.mapControls} pointerEvents="box-none">
        {/* GPS Button */}
        <TouchableOpacity
          style={[styles.gpsButton, isFetchingLocation && styles.gpsButtonActive]}
          onPress={requestLocationPermission}
          activeOpacity={0.8}
          disabled={isFetchingLocation}
        >
          {isFetchingLocation ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Image
              source={require('../assets/ui-icons/address-icon.png')}
              style={styles.gpsIcon}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => {
              const currentZoom = cameraPosition.zoom;
              const currentLat = cameraPosition.lat;
              const currentLon = cameraPosition.lon;
              const newZoom = Math.min(currentZoom + 1, 20);

              if (mapRef.current) {
                mapRef.current.setZoom(newZoom, 0.3);
              }
              setCameraPosition({ lat: currentLat, lon: currentLon, zoom: newZoom });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => {
              const currentZoom = cameraPosition.zoom;
              const currentLat = cameraPosition.lat;
              const currentLon = cameraPosition.lon;
              const newZoom = Math.max(currentZoom - 1, 5);

              if (mapRef.current) {
                mapRef.current.setZoom(newZoom, 0.3);
              }
              setCameraPosition({ lat: currentLat, lon: currentLon, zoom: newZoom });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
        {isGeocoding ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('auth.fetchingAddress') || 'Getting address...'}</Text>
          </View>
        ) : localSelectedAddress ? (
          <View style={styles.addressContainer}>
            <View style={styles.addressHeader}>
              <Image
                source={require('../assets/ui-icons/address-icon.png')}
                style={styles.addressIcon3d}
                resizeMode="contain"
              />
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{t('auth.selectedAddress') || 'Selected Location'}</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {localSelectedAddress.address}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleUseAddress}
              activeOpacity={0.9}
            >
              <Text style={styles.confirmButtonText}>{t('auth.useThisAddress') || 'Use This Address'}</Text>
              <Text style={styles.confirmButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../assets/mascot/water-drop-mascot.png')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>{t('auth.noLocationSelected') || 'Select Your Location'}</Text>
              <Text style={styles.emptySubtitle}>
                {t('auth.tapGPSButton') || 'Tap on the map or use GPS button to find your address'}
              </Text>
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
    backgroundColor: '#F8FAFC',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  searchContainerFull: {
    marginLeft: 0,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    padding: 0,
  },

  // Suggestions
  suggestionsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: 300,
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  suggestionsList: {
    borderRadius: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  suggestionPinIcon: {
    width: 44,
    height: 44,
  },
  suggestionContent: {
    flex: 1,
    gap: 6,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  suggestionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  suggestionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  suggestionArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  suggestionArrowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // Map Controls
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 240,
    zIndex: 50,
    gap: 12,
  },
  gpsButton: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gpsButtonActive: {
    opacity: 0.7,
  },
  gpsIcon: {
    width: 44,
    height: 44,
  },
  zoomControls: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 50,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 28,
    includeFontPadding: false,
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 20,
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    minHeight: 180,
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },

  // Address Container
  addressContainer: {
    gap: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressIcon3d: {
    width: 56,
    height: 56,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 22,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmButtonArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Empty State
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mascotImage: {
    width: 100,
    height: 100,
  },
  emptyTextContainer: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 20,
  },
});
