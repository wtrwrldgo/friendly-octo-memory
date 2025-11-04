# Yandex MapKit Setup Guide

Complete setup instructions for integrating Yandex MapKit into WaterGo React Native + Expo app.

---

## A) Setup Steps

### Step 1: Install Dependencies

```bash
npm install react-native-yamap
npx expo install expo-location
```

### Step 2: Configure Expo for Custom Native Code

Since `react-native-yamap` requires native code, you need to use Expo's **development build** (not Expo Go).

```bash
npx expo install expo-dev-client
```

### Step 3: Update `app.json`

Add the following to your `app.json`:

```json
{
  "expo": {
    "name": "watergo-client",
    "slug": "watergo-client",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.watergo.client",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "WaterGo needs your location to deliver water to your address.",
        "NSLocationAlwaysUsageDescription": "WaterGo needs your location to provide accurate delivery services.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "WaterGo needs your location to deliver water to your address."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.watergo.client",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "WaterGo needs your location to deliver water to your address.",
          "locationWhenInUsePermission": "WaterGo needs your location to deliver water to your address."
        }
      ]
    ]
  }
}
```

### Step 4: Initialize Yandex MapKit

Create `/config/mapkit.config.ts`:

```typescript
export const YANDEX_MAPKIT_KEY = '34c20e7b-cade-43bd-a252-fea9b47389e6';

export const DEFAULT_LOCATION = {
  // Nukus, Uzbekistan
  latitude: 42.4531,
  longitude: 59.6103,
  zoom: 12
};
```

### Step 5: Configure iOS (Info.plist)

After running `npx expo prebuild`, edit `ios/watergo-client/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>WaterGo needs your location to deliver water to your address.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>WaterGo needs your location to provide accurate delivery services.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>WaterGo needs your location to deliver water to your address.</string>
```

### Step 6: Configure Android (AndroidManifest.xml)

After running `npx expo prebuild`, edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Location Permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme">

      <!-- Yandex MapKit API Key -->
      <meta-data
        android:name="com.yandex.mapkit.API_KEY"
        android:value="34c20e7b-cade-43bd-a252-fea9b47389e6" />

      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
```

### Step 7: Initialize MapKit in App Entry

Update `App.tsx` to initialize Yandex MapKit:

```typescript
import { YaMap } from 'react-native-yamap';
import { YANDEX_MAPKIT_KEY } from './config/mapkit.config';

// Initialize Yandex MapKit
YaMap.init(YANDEX_MAPKIT_KEY);

// Rest of your App.tsx code...
```

### Step 8: Build Development Client

```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

### Step 9: Add Pin Icon

Place a pin icon image at `assets/pin.png` (40x40 or 60x60 PNG with transparency).

---

## Important Notes

1. **Expo Go Not Supported**: `react-native-yamap` requires custom native code, so you MUST use a development build, not Expo Go.

2. **Prebuild**: Run `npx expo prebuild` to generate iOS/Android native folders if they don't exist.

3. **API Key**: The Yandex MapKit key `34c20e7b-cade-43bd-a252-fea9b47389e6` is configured in both:
   - AndroidManifest.xml (for Android)
   - YaMap.init() call (for iOS)

4. **Location Permissions**: The app will request location permission when the screen loads.

5. **Geocoding**: Yandex MapKit provides reverse geocoding via `YaMap.geocode()` and search via `YaMap.search()`.

---

## Build Commands Summary

```bash
# Install dependencies
npm install react-native-yamap
npx expo install expo-location expo-dev-client

# Generate native folders
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

---

## Troubleshooting

### iOS Build Fails
- Run `cd ios && pod install && cd ..`
- Clean build: `cd ios && xcodebuild clean && cd ..`
- Rebuild: `npx expo run:ios`

### Android Build Fails
- Clean: `cd android && ./gradlew clean && cd ..`
- Rebuild: `npx expo run:android`

### Location Permission Not Showing
- Check Info.plist has location usage descriptions
- Check AndroidManifest.xml has location permissions
- Uninstall and reinstall app

---

**Ready to use!** After completing these steps, `SelectAddressScreen.tsx` will work correctly.
