# API Integration Guide

This guide explains how to configure and use the API service layer in the WaterGo app.

## Overview

The app has been configured with a flexible API service layer that can seamlessly switch between:
- **Mock API** - For development and testing without a backend
- **Real API** - For connecting to your actual backend

## Architecture

### Service Layer Structure

```
services/
├── api.ts                 # Main API service (public interface)
├── mock-api.service.ts    # Mock API implementation
├── real-api.service.ts    # Real backend API implementation
├── http.service.ts        # Axios HTTP client with interceptors
└── storage.service.ts     # AsyncStorage wrapper for auth tokens

config/
└── api.config.ts          # Environment configuration
```

### Data Flow

```
Screen/Component
    ↓
api.ts (decides mock vs real)
    ↓
mock-api.service.ts OR real-api.service.ts
    ↓
http.service.ts (real API only)
    ↓
Backend API
```

---

## Configuration

### 1. Environment Setup

Edit `/config/api.config.ts` to configure your environments:

```typescript
const ENV = {
  development: {
    baseURL: 'http://localhost:3000/api',    // Your local backend
    timeout: 15000,
    useMockData: true,                        // Use mock data by default
  },
  staging: {
    baseURL: 'https://staging-api.watergo.com/api',
    timeout: 15000,
    useMockData: false,                       // Use real API
  },
  production: {
    baseURL: 'https://api.watergo.com/api',
    timeout: 10000,
    useMockData: false,                       // Use real API
  },
};
```

### 2. Runtime Mode Switching

You can toggle between mock and real API at runtime:

```typescript
import { setUseMockData } from './config/api.config';

// Switch to mock mode
setUseMockData(true);

// Switch to real API mode
setUseMockData(false);
```

### 3. Check Current Mode

```typescript
import ApiService from './services/api';

if (ApiService.isUsingMockData()) {
  console.log('Using mock data');
} else {
  console.log('Using real API');
}
```

---

## Usage Examples

### Authentication

```typescript
import ApiService from './services/api';

// Send verification code
try {
  const result = await ApiService.sendVerificationCode('+998901234567');
  console.log(result.message);
} catch (error) {
  console.error(error.message);
}

// Verify code
try {
  const { token, user } = await ApiService.verifyCode('+998901234567', '1234');
  // Token is automatically stored in AsyncStorage
  console.log('Logged in:', user);
} catch (error) {
  console.error(error.message);
}

// Logout
await ApiService.logout();
```

### Fetching Data

```typescript
import ApiService from './services/api';

// Get vendors
const firms = await ApiService.getFirms();

// Get products for a specific vendor
const products = await ApiService.getProducts('firm_123');

// Get user addresses
const addresses = await ApiService.getUserAddresses();
```

### Creating Orders

```typescript
import ApiService from './services/api';

const order = await ApiService.createOrder({
  items: [
    { productId: 'prod_1', quantity: 2 },
    { productId: 'prod_2', quantity: 1 },
  ],
  firmId: 'firm_123',
  addressId: 'addr_456',
  total: 45.00,
});

console.log('Order created:', order.id);
```

### Error Handling

All API methods throw errors with user-friendly messages:

```typescript
try {
  await ApiService.createOrder(orderData);
} catch (error) {
  // Error message is already formatted for display
  Alert.alert('Error', error.message);
}
```

---

## HTTP Client Features

### Automatic Token Management

The HTTP client automatically:
- Adds auth tokens to requests
- Refreshes expired tokens
- Retries failed requests after token refresh
- Clears storage on authentication failure

### Request/Response Interceptors

**Request Interceptor:**
- Adds `Authorization: Bearer <token>` header
- Automatically retrieves token from AsyncStorage

**Response Interceptor:**
- Handles 401 errors (token refresh)
- Queues requests during token refresh
- Formats error messages

### Network Error Handling

```typescript
try {
  const data = await ApiService.getFirms();
} catch (error) {
  if (error.statusCode === 0) {
    // Network error
    Alert.alert('No Internet', 'Please check your connection');
  } else if (error.statusCode === 401) {
    // Unauthorized - user will be logged out automatically
  } else {
    // Other errors
    Alert.alert('Error', error.message);
  }
}
```

---

## Storage Service

The storage service manages persistent data using AsyncStorage.

### Available Methods

```typescript
import StorageService from './services/storage.service';

// Auth tokens
await StorageService.setAuthToken('token_here');
const token = await StorageService.getAuthToken();
await StorageService.removeAuthToken();

// Refresh tokens
await StorageService.setRefreshToken('refresh_token_here');
const refreshToken = await StorageService.getRefreshToken();

// User data (caching)
await StorageService.setUserData(user);
const cachedUser = await StorageService.getUserData();

// Language preference
await StorageService.setLanguage('en');
const language = await StorageService.getLanguage();

// Clear all (logout)
await StorageService.clearAll();
```

---

## Migration Guide

### From Old API to New API

The new API service maintains backward compatibility with function exports:

**Old way (still works):**
```typescript
import { getFirms, createOrder } from './services/api';

const firms = await getFirms();
```

**New way (recommended):**
```typescript
import ApiService from './services/api';

const firms = await ApiService.getFirms();
```

Both approaches work identically. The new class-based approach provides:
- Better type inference
- Easier testing and mocking
- Clearer service boundaries

---

## Backend Integration Checklist

When you're ready to connect to a real backend:

### 1. API Endpoint Implementation

Ensure your backend implements all endpoints documented in `API_DOCUMENTATION.md`:

- [ ] Authentication endpoints (`/auth/send-code`, `/auth/verify-code`, etc.)
- [ ] User management endpoints
- [ ] Address CRUD endpoints
- [ ] Firms/vendors endpoints
- [ ] Products endpoints
- [ ] Orders endpoints
- [ ] Location services

### 2. Response Format

Ensure all responses follow the wrapper format:

```json
{
  "success": true,
  "data": <actual_data>,
  "message": "Optional message"
}
```

### 3. Error Format

Ensure errors follow this format:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "statusCode": 400,
  "errors": {
    "field": ["Validation error"]
  }
}
```

### 4. Authentication

- [ ] Implement JWT token generation
- [ ] Implement refresh token mechanism
- [ ] Add token expiration (recommended: 15 minutes for access, 7 days for refresh)
- [ ] Implement token rotation on refresh

### 5. CORS Configuration

Enable CORS for your mobile app:

```javascript
// Express example
app.use(cors({
  origin: '*', // Or specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 6. Testing

1. Start your backend server
2. Update `baseURL` in `/config/api.config.ts`
3. Set `useMockData: false`
4. Test authentication flow:
   - Send verification code
   - Verify code
   - Check token storage
5. Test authenticated endpoints
6. Test token refresh mechanism
7. Test error handling

---

## Debugging

### Enable Detailed Logging

Add console logs in HTTP service for debugging:

```typescript
// In http.service.ts
this.axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    // ...
  }
);

this.axiosInstance.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.config.url, response.status);
    return response;
  }
);
```

### Check API Mode

Add a debug screen to check current configuration:

```typescript
import { API_CONFIG, shouldUseMockData } from './config/api.config';

console.log('API Base URL:', API_CONFIG.baseURL);
console.log('Using Mock Data:', shouldUseMockData());
console.log('Timeout:', API_CONFIG.timeout);
```

### Monitor AsyncStorage

Use React Native Debugger or:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check stored token
const token = await AsyncStorage.getItem('@watergo/auth_token');
console.log('Stored token:', token);

// List all keys
const keys = await AsyncStorage.getAllKeys();
console.log('AsyncStorage keys:', keys);
```

---

## Performance Optimization

### Caching Strategy

The app caches user data in AsyncStorage to reduce API calls:

```typescript
// User data is cached after login and profile updates
const user = await ApiService.getUserProfile();
// User data is now in AsyncStorage

// Retrieve from cache
const cachedUser = await StorageService.getUserData();
```

### Request Deduplication

To prevent duplicate requests, implement request deduplication:

```typescript
let firmsPromise: Promise<Firm[]> | null = null;

export const getFirmsOnce = async (): Promise<Firm[]> => {
  if (!firmsPromise) {
    firmsPromise = ApiService.getFirms();
  }
  return firmsPromise;
};
```

### Pagination

For large datasets, implement pagination in your backend and app:

```typescript
// Backend: Add pagination support
GET /orders?page=1&limit=20

// App: Load more on scroll
const [page, setPage] = useState(1);
const loadMore = async () => {
  const newOrders = await ApiService.getOrders(page + 1);
  setOrders([...orders, ...newOrders]);
  setPage(page + 1);
};
```

---

## Security Best Practices

1. **Never log sensitive data** (tokens, passwords, etc.)
2. **Use HTTPS** in production
3. **Implement certificate pinning** for extra security
4. **Validate all inputs** on both client and server
5. **Implement rate limiting** on authentication endpoints
6. **Use secure token storage** (AsyncStorage is encrypted on iOS)
7. **Implement biometric authentication** for sensitive operations
8. **Add request signing** for critical operations

---

## Common Issues

### Issue: "Network request failed"

**Causes:**
- Backend not running
- Wrong base URL
- CORS issues
- Network connectivity

**Solution:**
```typescript
// Check configuration
console.log('Base URL:', API_CONFIG.baseURL);

// Test with curl
curl https://your-api.com/api/firms

// Enable mock data temporarily
setUseMockData(true);
```

### Issue: "401 Unauthorized" on all requests

**Causes:**
- Token not stored
- Token expired
- Backend not accepting token

**Solution:**
```typescript
// Check token
const token = await StorageService.getAuthToken();
console.log('Token:', token ? 'exists' : 'missing');

// Re-login
await ApiService.logout();
await ApiService.verifyCode(phone, code);
```

### Issue: Infinite token refresh loop

**Causes:**
- Refresh token endpoint returning 401
- Refresh token expired

**Solution:**
```typescript
// Clear storage and force re-login
await StorageService.clearAll();
// Navigate to login screen
```

---

## Support

For issues or questions:
1. Check `API_DOCUMENTATION.md` for endpoint specs
2. Review console logs for errors
3. Test with mock data to isolate issues
4. Verify backend is returning correct response format
