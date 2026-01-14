/**
 * Navigation Service - Driver App
 * Handles opening navigation apps (Google Maps, Yandex Maps, Apple Maps)
 */

import { Linking, Platform, Alert } from 'react-native';

export enum NavigationApp {
  GOOGLE_MAPS = 'Google Maps',
  YANDEX_MAPS = 'Yandex Maps',
  APPLE_MAPS = 'Apple Maps',
}

class NavigationService {
  /**
   * Open navigation to destination coordinates
   */
  async navigateTo(
    latitude: number,
    longitude: number,
    destinationLabel?: string,
    app: NavigationApp = NavigationApp.GOOGLE_MAPS
  ): Promise<void> {
    try {
      let url = '';

      switch (app) {
        case NavigationApp.GOOGLE_MAPS:
          url = this.getGoogleMapsUrl(latitude, longitude, destinationLabel);
          break;
        case NavigationApp.YANDEX_MAPS:
          url = this.getYandexMapsUrl(latitude, longitude);
          break;
        case NavigationApp.APPLE_MAPS:
          url = this.getAppleMapsUrl(latitude, longitude, destinationLabel);
          break;
      }

      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error(`Cannot open ${app}. Please install the app.`);
      }
    } catch (error: any) {
      console.error(`[Navigation] Error opening ${app}:`, error);
      throw error;
    }
  }

  /**
   * Show navigation app picker
   */
  showNavigationPicker(
    latitude: number,
    longitude: number,
    destinationLabel?: string
  ): void {
    const options: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [
      {
        text: NavigationApp.GOOGLE_MAPS,
        onPress: () => { this.navigateTo(latitude, longitude, destinationLabel, NavigationApp.GOOGLE_MAPS); },
      },
      {
        text: NavigationApp.YANDEX_MAPS,
        onPress: () => { this.navigateTo(latitude, longitude, destinationLabel, NavigationApp.YANDEX_MAPS); },
      },
    ];

    // Add Apple Maps option for iOS
    if (Platform.OS === 'ios') {
      options.push({
        text: NavigationApp.APPLE_MAPS,
        onPress: () => { this.navigateTo(latitude, longitude, destinationLabel, NavigationApp.APPLE_MAPS); },
      });
    }

    options.push({
      text: 'Cancel',
      onPress: () => {},
      style: 'cancel',
    });

    Alert.alert('Choose Navigation App', 'Select a navigation app to open:', options);
  }

  /**
   * Get Google Maps URL
   */
  private getGoogleMapsUrl(lat: number, lng: number, _label?: string): string {
    const destination = `${lat},${lng}`;

    // Use different URL schemes for iOS and Android
    if (Platform.OS === 'ios') {
      // iOS: Try to open Google Maps app, fallback to web
      return `comgooglemaps://?daddr=${destination}&directionsmode=driving`;
    } else {
      // Android: Use intent to open Google Maps app
      return `google.navigation:q=${destination}&mode=d`;
    }
  }

  /**
   * Get Yandex Maps URL
   */
  private getYandexMapsUrl(lat: number, lng: number): string {
    // Yandex Maps universal URL scheme
    return `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lng}`;
  }

  /**
   * Get Apple Maps URL (iOS only)
   */
  private getAppleMapsUrl(lat: number, lng: number, label?: string): string {
    const destination = `${lat},${lng}`;
    const labelParam = label ? `&q=${encodeURIComponent(label)}` : '';

    return `maps://?daddr=${destination}${labelParam}&dirflg=d`;
  }

  /**
   * Check if navigation app is installed
   */
  async isNavigationAppAvailable(app: NavigationApp): Promise<boolean> {
    try {
      let url = '';

      switch (app) {
        case NavigationApp.GOOGLE_MAPS:
          url = Platform.OS === 'ios' ? 'comgooglemaps://' : 'google.navigation:q=0,0';
          break;
        case NavigationApp.YANDEX_MAPS:
          url = 'yandexnavi://';
          break;
        case NavigationApp.APPLE_MAPS:
          url = 'maps://';
          break;
      }

      return await Linking.canOpenURL(url);
    } catch (error) {
      console.error(`[Navigation] Error checking ${app} availability:`, error);
      return false;
    }
  }

  /**
   * Get available navigation apps
   */
  async getAvailableNavigationApps(): Promise<NavigationApp[]> {
    const apps: NavigationApp[] = [];

    // Check Google Maps
    if (await this.isNavigationAppAvailable(NavigationApp.GOOGLE_MAPS)) {
      apps.push(NavigationApp.GOOGLE_MAPS);
    }

    // Check Yandex Maps
    if (await this.isNavigationAppAvailable(NavigationApp.YANDEX_MAPS)) {
      apps.push(NavigationApp.YANDEX_MAPS);
    }

    // Check Apple Maps (iOS only)
    if (Platform.OS === 'ios' && await this.isNavigationAppAvailable(NavigationApp.APPLE_MAPS)) {
      apps.push(NavigationApp.APPLE_MAPS);
    }

    return apps;
  }

  /**
   * Open navigation with fallback
   * Tries preferred app first, then falls back to available apps
   */
  async navigateToWithFallback(
    latitude: number,
    longitude: number,
    destinationLabel?: string,
    preferredApp: NavigationApp = NavigationApp.GOOGLE_MAPS
  ): Promise<void> {
    try {
      // Try preferred app first
      await this.navigateTo(latitude, longitude, destinationLabel, preferredApp);
    } catch (error) {
      console.log(`[Navigation] ${preferredApp} not available, trying fallback...`);

      // Get available apps
      const availableApps = await this.getAvailableNavigationApps();

      if (availableApps.length === 0) {
        throw new Error('No navigation apps available');
      }

      // Try first available app
      try {
        await this.navigateTo(latitude, longitude, destinationLabel, availableApps[0]);
      } catch (fallbackError) {
        throw new Error('Failed to open any navigation app');
      }
    }
  }
}

export default new NavigationService();
