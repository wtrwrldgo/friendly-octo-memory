# Navigation Icons

This folder contains the branded navigation app icons used in the navigation picker modal.

## Required Icons

You need to add the following icon files to this folder:

1. **google-maps.png** - Google Maps icon
2. **yandex-maps.png** - Yandex Maps icon
3. **apple-maps.png** - Apple Maps icon (iOS only)

## Icon Specifications

- **Size**: 512x512 px (will be scaled down automatically)
- **Format**: PNG with transparent background
- **Style**: Official app icon design

## Where to Get the Icons

### Google Maps
- Download from: https://about.google/brand-resources/
- Or extract from: https://www.google.com/maps/
- Icon style: Multicolor pin with Google colors

### Yandex Maps
- Download from: https://yandex.com/company/brand/identity/
- Or use Yandex brand assets
- Icon style: Red Yandex logo or compass

### Apple Maps
- Extract from iOS system or app store
- Icon style: Apple Maps app icon
- Alternative: Use SF Symbols "map.fill"

## Current Status

The component currently uses emoji fallbacks:
- 🗺️ for Google Maps
- 🧭 for Yandex Maps
- 🗺 for Apple Maps

Once you add the PNG files, update the NavigationPickerModal component to use them.

## How to Update

After adding the icon files, update `/components/NavigationPickerModal.tsx`:

```typescript
const navigationOptions: NavigationOption[] = [
  {
    app: NavigationApp.GOOGLE_MAPS,
    icon: require('../assets/navigation-icons/google-maps.png'),
    iconType: 'image',
    color: '#4285F4',
    bgColor: '#E8F0FE',
    subtitle: 'Navigate with Google Maps',
  },
  {
    app: NavigationApp.YANDEX_MAPS,
    icon: require('../assets/navigation-icons/yandex-maps.png'),
    iconType: 'image',
    color: '#FF0000',
    bgColor: '#FFE5E5',
    subtitle: 'Navigate with Yandex Maps',
  },
];

if (Platform.OS === 'ios') {
  navigationOptions.push({
    app: NavigationApp.APPLE_MAPS,
    icon: require('../assets/navigation-icons/apple-maps.png'),
    iconType: 'image',
    color: '#007AFF',
    bgColor: '#E5F1FF',
    subtitle: 'Navigate with Apple Maps',
  });
}
```

## License Note

Make sure you have the right to use these branded icons in your application. Most companies allow use of their logos for linking to their services, but check their brand guidelines.
