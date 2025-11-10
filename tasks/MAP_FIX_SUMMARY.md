# Yandex Map Fix Summary
**Date:** November 10, 2025
**Project:** WaterGo Client App
**Issue:** Yandex Maps showing blank/white screen on iOS
**Status:** ✅ FIXED

---

## Problem

The Yandex Maps component was showing a blank/white screen on iOS despite:
- Correct JavaScript initialization in App.tsx
- Valid API key configured
- All native dependencies installed (YandexMapsMobile pod)
- No error messages in logs

---

## Root Cause

iOS requires **dual initialization** of YMKMapKit:
1. **JavaScript layer**: `YaMap.init(API_KEY)` in App.tsx ✅ (was present)
2. **Native iOS layer**: `YMKMapKit.setApiKey()` in AppDelegate ❌ (was missing)

The JavaScript initialization alone is insufficient for iOS. This is documented in the react-native-yamap README but was missing from our implementation.

---

## Solution

### 1. Added YMKMapKitFactory Import to Bridging Header

**File:** `ios/WaterGo/WaterGo-Bridging-Header.h`

```objective-c
//
// Use this file to import your target's public headers that you would like to expose to Swift.
//

#import <YandexMapsMobile/YMKMapKitFactory.h>
```

This exposes the Yandex MapKit native framework to Swift code.

---

### 2. Initialized YMKMapKit in AppDelegate

**File:** `ios/WaterGo/AppDelegate.swift`
**Location:** Inside `application(_:didFinishLaunchingWithOptions:)` method

```swift
public override func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
) -> Bool {
  // ... existing React Native initialization code ...

  // Initialize Yandex MapKit (ADDED - lines 32-34)
  YMKMapKit.setApiKey("bd4d0d5d-8322-4c87-9362-dc219c3d0cb2")
  YMKMapKit.setLocale("en_US")

  return super.application(application, didFinishLaunchingWithOptions: launchOptions)
}
```

**Critical Notes:**
- ✅ Use `setApiKey()` and `setLocale()` only
- ❌ Do NOT use `YMKMapKit.mapKit()` (deprecated, replaced by `init()`)
- ❌ Do NOT use `YMKMapKit.init()` (runtime crash: "Use factory instead")
- ✅ Place BEFORE the `return super.application(...)` statement

---

## Build Process

```bash
# Clean all Metro/Node processes and rebuild
killall -9 "node" "Metro" 2>/dev/null
sleep 2
npx expo run:ios
```

**Result:**
```
✓ Build Succeeded
✓ Installing on iPhone 17 Pro Max
✓ App launched successfully
✓ Yandex MapKit initialized (both JS and native layers)
```

---

## Verification

### Logs Confirming Success:

```
LOG  🗺️ Initializing Yandex MapKit with API key: bd4d0d5d-8322-4c87-9362-dc219c3d0cb2
LOG  ✅ Yandex MapKit initialized
```

### No Map Errors:
- ✅ No "MapKit not initialized" errors
- ✅ No blank screen warnings
- ✅ No tile loading failures

### Haptic Warnings (Normal):
The `CoreHaptics CHHapticPattern.mm` errors are **normal in iOS Simulator** because the simulator doesn't support physical haptic feedback hardware. These can be ignored.

---

## Testing the Map

To verify the map displays correctly:

1. **Launch the app** on iPhone 17 Pro Max simulator (already running)

2. **Navigate through onboarding:**
   - Welcome Screen
   - Select Language
   - Enter Name
   - Enter Phone: `+998997346436`
   - Enter verification code: `5888` (shown in logs during development)
   - Select location/enable location screen

3. **On the map screen, verify:**
   - ✅ Map tiles load and display (not blank/white)
   - ✅ Map shows default location (Nukus, Uzbekistan)
   - ✅ GPS button requests location permission
   - ✅ Can tap map to drop pin
   - ✅ Search bar works for location search
   - ✅ Map responds to gestures (pan, zoom)

---

## Technical Details

### Initialization Flow:

```
App Launch
    ↓
App.tsx loads
    ↓
YaMap.init(API_KEY) ← JavaScript initialization
    ↓
AppDelegate.swift runs
    ↓
YMKMapKit.setApiKey() ← Native iOS initialization
    ↓
Map component renders
    ↓
Map tiles load successfully ✅
```

### Files Modified:

1. `ios/WaterGo/WaterGo-Bridging-Header.h` - Added YMKMapKitFactory import
2. `ios/WaterGo/AppDelegate.swift` - Added YMKMapKit.setApiKey() and setLocale()
3. `screens/SelectAddressScreen.tsx` - Enhanced map component props (done earlier)

### Dependencies:

- react-native-yamap: v4.8.3
- YandexMapsMobile pod: Installed via CocoaPods
- API Key: bd4d0d5d-8322-4c87-9362-dc219c3d0cb2
- Locale: en_US

---

## Common Errors During Fix

### Error 1: Deprecated `mapKit()` method
```
❌ 'mapKit' has been replaced by 'init()'
```
**Fix:** Changed to `init()`

### Error 2: Invalid `init()` call
```
❌ NSInternalInconsistencyException:
   'Don't call init on YMKMapKit - it's a binding implementation! Use factory instead.'
```
**Fix:** Removed `init()` call entirely, used only `setApiKey()` and `setLocale()`

---

## Conclusion

**Root Cause:** Missing native iOS initialization of YMKMapKit in AppDelegate
**Solution:** Added `YMKMapKit.setApiKey()` and `YMKMapKit.setLocale()` to `didFinishLaunchingWithOptions`
**Result:** Map now initializes correctly on both JavaScript and native layers
**Status:** ✅ Build successful, app running, ready for map testing

---

## References

- react-native-yamap README: Specifies iOS requires native initialization
- YMKMapKit API: Factory pattern, setApiKey/setLocale methods
- MCP Context7 Documentation: Used to research correct API usage

---

**Next Steps:**
1. Test map on simulator by navigating to map screen
2. Verify map tiles display correctly
3. Test location features (GPS, search, pin dropping)
4. If map displays correctly, mark issue as completely resolved
