# SelectAddressScreen Usage Guide

Complete guide for using the new Yandex MapKit-powered address picker screen.

---

## Features Implemented

✓ Yandex Map integration
✓ Location permission handling
✓ Automatic centering on user location
✓ Fallback to Nukus, Uzbekistan if permission denied
✓ Pin dropping on map tap
✓ Reverse geocoding (coordinates → address)
✓ Forward geocoding (text search → coordinates)
✓ Search suggestions dropdown (up to 5 results)
✓ "Use this address" button
✓ Full TypeScript support
✓ Production-ready error handling

---

## How to Navigate to SelectAddressScreen

### From Any Screen in Main App

```typescript
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const MyComponent = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleSelectAddress = () => {
    navigation.navigate('SelectAddress');
  };

  return (
    <TouchableOpacity onPress={handleSelectAddress}>
      <Text>Select Address</Text>
    </TouchableOpacity>
  );
};
```

---

## Screen Functionality

### 1. **Map Display**
- Shows Yandex Map centered on user location (or Nukus if denied)
- User can pan, zoom, and explore the map
- Tap anywhere on map to drop a pin

### 2. **Location Permission**
- Automatically requests location permission on mount
- If **granted**: Centers camera on user's current location
- If **denied**: Centers camera on Nukus, Uzbekistan (42.4531, 59.6103)

### 3. **Pin Dropping**
- Tap any point on the map
- Pin drops at that location
- Automatically reverse geocodes to get address
- Shows "Fetching address..." while loading

### 4. **Reverse Geocoding**
Converts coordinates to human-readable address:
```
Input:  { lat: 42.4531, lon: 59.6103 }
Output: "Nukus, Uzbekistan, улица Амира Темура, 15"
```

### 5. **Search Input**
- Type at least 3 characters in search box
- Debounced search (500ms delay)
- Shows loading indicator while searching
- Displays up to 5 suggestions in dropdown

### 6. **Search Suggestions**
- Tap any suggestion
- Map automatically moves to that location
- Pin drops at selected location
- Address updates in bottom panel

### 7. **Selected Address Display**
Shows at bottom of screen:
- Label: "Selected address:"
- Full address text
- Coordinates (latitude, longitude)

### 8. **Use This Address Button**
- Taps the button
- Console logs: `{ lat, lon, address }`
- Shows alert with selected address details
- Ready to integrate with your address saving logic

---

## Example: Integrate with UserContext

To save the selected address to your context:

```typescript
// In SelectAddressScreen.tsx

import { useUser } from '../context/UserContext';

export default function SelectAddressScreen() {
  const { addAddress } = useUser();
  const navigation = useNavigation();

  const handleUseAddress = () => {
    if (selectedAddress) {
      // Save to context
      addAddress({
        id: Date.now().toString(),
        title: 'New Address',
        address: selectedAddress.address,
        lat: selectedAddress.lat,
        lng: selectedAddress.lon,
        isDefault: false,
      });

      // Navigate back
      navigation.goBack();
    }
  };

  // ... rest of component
}
```

---

## State Management

The screen manages the following state:

```typescript
const [searchQuery, setSearchQuery] = useState<string>('');
const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
const [isSearching, setIsSearching] = useState<boolean>(false);
const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
const [cameraPosition, setCameraPosition] = useState<CameraPosition>({...});
```

---

## API Calls

### Reverse Geocoding
```
GET https://geocode-maps.yandex.ru/1.x/
  ?apikey=34c20e7b-cade-43bd-a252-fea9b47389e6
  &geocode=59.6103,42.4531
  &format=json
  &results=1
  &lang=en
```

### Forward Geocoding (Search)
```
GET https://geocode-maps.yandex.ru/1.x/
  ?apikey=34c20e7b-cade-43bd-a252-fea9b47389e6
  &geocode=Tashkent
  &format=json
  &results=5
  &lang=en
```

---

## Error Handling

- Network errors → Uses coordinates as fallback address
- Permission denied → Defaults to Nukus, Uzbekistan
- Search errors → Shows empty suggestions
- Geocoding errors → Shows coordinates instead of address

---

## Console Output

When "Use this address" is pressed:

```javascript
Selected Address: {
  lat: 42.453123,
  lon: 59.610456,
  address: "Nukus, Uzbekistan, улица Амира Темура, 15"
}
```

---

## Customization

### Change Default Location
Edit `/config/mapkit.config.ts`:
```typescript
export const DEFAULT_LOCATION = {
  latitude: YOUR_LAT,
  longitude: YOUR_LON,
  zoom: 12,
};
```

### Change Pin Icon
Replace `/assets/pin.png` with your custom pin image (60x60 PNG).

### Change Search Debounce
Edit `/config/mapkit.config.ts`:
```typescript
export const GEOCODING_CONFIG = {
  debounceMs: 500, // Change to 300, 700, etc.
};
```

---

## Testing

### Test Location Permission
1. Run app on device (not simulator for real GPS)
2. Grant permission → Should center on your location
3. Deny permission → Should center on Nukus

### Test Search
1. Type "Tashkent" in search box
2. Wait 500ms
3. Should show 5 suggestions
4. Tap one → Map moves to that location

### Test Pin Dropping
1. Tap anywhere on map
2. Pin should appear
3. Bottom panel shows address
4. Tap "Use this address" → Console log + alert

---

## Next Steps

1. **Add to Profile Screen**: Add button to change delivery address
2. **Save to Backend**: Integrate with your API to save addresses
3. **Address List**: Show saved addresses in AddressSelectScreen
4. **Edit Address**: Allow editing address title/notes
5. **Delete Address**: Allow removing saved addresses

---

**Ready to use!** Navigate to SelectAddressScreen from anywhere in your app.
