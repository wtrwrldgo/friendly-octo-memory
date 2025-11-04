# Quick Start Guide - API Integration

## TL;DR

Your WaterGo app now has a complete API service layer. It currently uses **mock data** and is ready to connect to a real backend.

---

## Current State

```
✅ App works with mock data
✅ All screens functional
✅ API service layer ready
✅ Full TypeScript support
⏳ Backend not connected yet
```

---

## To Run the App (Mock Mode)

```bash
# Install dependencies (already done)
npm install

# Start Expo
npx expo start

# Scan QR code with Expo Go
```

App will work normally with mock data.

---

## To Connect Real Backend

### 1. Update Configuration

Edit `/config/api.config.ts`:

```typescript
development: {
  baseURL: 'http://YOUR_BACKEND_URL:3000/api',  // Your backend URL
  timeout: 15000,
  useMockData: false,  // Change to false
},
```

### 2. Implement Backend

Your backend must implement these endpoints (see `API_DOCUMENTATION.md` for details):

**Authentication:**
- `POST /auth/send-code`
- `POST /auth/verify-code`
- `POST /auth/refresh-token`
- `POST /auth/logout`

**User:**
- `GET /user/profile`
- `PUT /user/profile`
- `GET /user/addresses`
- `POST /user/addresses`
- `PUT /user/addresses/:id`
- `DELETE /user/addresses/:id`

**Data:**
- `GET /firms`
- `GET /firms/:id`
- `GET /products?firmId=xxx`
- `GET /products/:id`

**Orders:**
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `GET /orders/:id/status`
- `GET /orders/:id/driver`

**Location:**
- `POST /location/reverse-geocode`

### 3. Response Format

All responses must follow this format:

```json
{
  "success": true,
  "data": {
    // Your actual data here
  }
}
```

### 4. Test

```bash
# Restart the app
npx expo start

# Test authentication flow
# Test ordering flow
# Monitor console for errors
```

---

## Quick Code Examples

### Call API Directly

```typescript
import ApiService from './services/api';

// In any component
const firms = await ApiService.getFirms();
const order = await ApiService.createOrder(orderData);
```

### Use with React Hook

```typescript
import { useApi } from './hooks/useApi';
import ApiService from './services/api';

function MyScreen() {
  const { data, loading, error } = useApi(
    () => ApiService.getFirms(),
    { immediate: true }
  );

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error.message}</Text>;

  return <FlatList data={data} ... />;
}
```

### Create Order Example

```typescript
import { useMutation } from './hooks/useApi';
import ApiService from './services/api';

function CheckoutButton() {
  const { mutate: createOrder, loading } = useMutation(
    (data) => ApiService.createOrder(data),
    {
      onSuccess: (order) => {
        navigation.navigate('OrderTracking', { orderId: order.id });
      }
    }
  );

  return (
    <Button
      onPress={() => createOrder({ items, firmId, addressId, total })}
      loading={loading}
    />
  );
}
```

---

## Toggle Mock/Real API

### In Code
```typescript
import { setUseMockData } from './config/api.config';

setUseMockData(true);   // Use mock data
setUseMockData(false);  // Use real API
```

### In Config
```typescript
// config/api.config.ts
development: {
  useMockData: true,  // true = mock, false = real
}
```

---

## File Structure

```
services/
├── api.ts                   # Main API (use this)
├── mock-api.service.ts      # Mock implementation
├── real-api.service.ts      # Real backend implementation
├── http.service.ts          # HTTP client (axios)
└── storage.service.ts       # AsyncStorage wrapper

config/
└── api.config.ts            # Configuration

hooks/
└── useApi.ts                # React hooks for API calls

types/
└── api.types.ts             # TypeScript types
```

---

## Important Files

1. **`API_DOCUMENTATION.md`** - Complete API specification
2. **`API_INTEGRATION_GUIDE.md`** - Detailed integration guide
3. **`USAGE_EXAMPLES.md`** - 20+ code examples
4. **`API_IMPLEMENTATION_SUMMARY.md`** - What was implemented

---

## Common Tasks

### Check if Using Mock Data
```typescript
import ApiService from './services/api';

console.log('Using mock:', ApiService.isUsingMockData());
```

### Get Current User
```typescript
const user = await ApiService.getUserProfile();
```

### Logout
```typescript
await ApiService.logout(); // Clears tokens and storage
```

### Handle Errors
```typescript
try {
  await ApiService.createOrder(data);
} catch (error) {
  Alert.alert('Error', error.message); // User-friendly message
}
```

---

## Debugging

### Check Token Storage
```typescript
import StorageService from './services/storage.service';

const token = await StorageService.getAuthToken();
console.log('Token:', token ? 'exists' : 'missing');
```

### View API Config
```typescript
import { API_CONFIG } from './config/api.config';

console.log('Base URL:', API_CONFIG.baseURL);
console.log('Using Mock:', API_CONFIG.useMockData);
```

### Enable Request Logging
Add to `/services/http.service.ts`:
```typescript
console.log('Request:', method, url, data);
```

---

## Troubleshooting

### "Network request failed"
- Check backend is running
- Verify baseURL is correct
- Check CORS settings on backend

### "401 Unauthorized"
- Token might be expired
- Re-login to get new token
- Check backend token validation

### App crashes after API change
- Clear cache: `npx expo start -c`
- Restart app
- Check TypeScript errors

---

## Testing Checklist

Before production:

- [ ] Test authentication (send code, verify)
- [ ] Test user profile fetch/update
- [ ] Test address CRUD operations
- [ ] Test vendor listing
- [ ] Test product fetching
- [ ] Test order creation
- [ ] Test order tracking
- [ ] Test logout
- [ ] Test token refresh
- [ ] Test error handling
- [ ] Test network offline scenario

---

## Production Checklist

- [ ] Set baseURL to production URL
- [ ] Enable HTTPS
- [ ] Set useMockData to false
- [ ] Test on real devices
- [ ] Monitor error logs
- [ ] Test token expiration
- [ ] Verify data persistence

---

## Need Help?

1. Check documentation files
2. Look at code examples in `USAGE_EXAMPLES.md`
3. Review TypeScript types in `/types/api.types.ts`
4. Check console logs for errors

---

## Package Commands

```bash
# Start app
npx expo start

# Start with cache clear
npx expo start -c

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# TypeScript check
npx tsc --noEmit

# Install packages
npm install
```

---

**You're all set! The app works with mock data now and is ready to connect to your backend when ready.**
