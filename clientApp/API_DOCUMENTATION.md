# WaterGo API Documentation

This document outlines the expected API endpoints and data formats for the WaterGo backend.

## Configuration

The app uses environment-based configuration defined in `/config/api.config.ts`:
- **Development**: Uses mock data by default
- **Staging**: Connects to staging API
- **Production**: Connects to production API

To switch between mock and real API, modify the `useMockData` flag in the configuration.

## Base URL

Configure your backend base URL in `/config/api.config.ts`:
```typescript
baseURL: 'https://api.watergo.com/api'
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

The app automatically handles:
- Token storage in AsyncStorage
- Token refresh on 401 responses
- Automatic retry of failed requests after token refresh

---

## API Endpoints

### 1. Authentication

#### POST /auth/send-code
Send verification code to user's phone.

**Request:**
```json
{
  "phone": "+998901234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Verification code sent successfully"
  }
}
```

---

#### POST /auth/verify-code
Verify phone number with code.

**Request:**
```json
{
  "phone": "+998901234567",
  "code": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "phone": "+998901234567",
      "language": "en"
    }
  }
}
```

---

#### POST /auth/refresh-token
Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token_here"
  }
}
```

---

#### POST /auth/logout
Logout user (invalidate tokens).

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 2. User Management

#### GET /user/profile
Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "phone": "+998901234567",
    "language": "en"
  }
}
```

---

#### PUT /user/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Smith",
  "language": "ru"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Smith",
    "phone": "+998901234567",
    "language": "ru"
  }
}
```

---

### 3. Address Management

#### GET /user/addresses
Get user's saved addresses.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "addr_1",
      "title": "Home",
      "address": "123 Main St, Tashkent",
      "lat": 41.2995,
      "lng": 69.2401,
      "isDefault": true
    }
  ]
}
```

---

#### POST /user/addresses
Add new address.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Office",
  "address": "456 Business Ave, Tashkent",
  "lat": 41.3123,
  "lng": 69.2567,
  "isDefault": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "addr_2",
    "title": "Office",
    "address": "456 Business Ave, Tashkent",
    "lat": 41.3123,
    "lng": 69.2567,
    "isDefault": false
  }
}
```

---

#### PUT /user/addresses/:id
Update address.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Home - New",
  "isDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "addr_1",
    "title": "Home - New",
    "address": "123 Main St, Tashkent",
    "lat": 41.2995,
    "lng": 69.2401,
    "isDefault": true
  }
}
```

---

#### DELETE /user/addresses/:id
Delete address.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 4. Firms (Vendors)

#### GET /firms
Get all available water vendors.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "firm_1",
      "name": "AquaPure",
      "logo": "https://example.com/logos/aquapure.png",
      "rating": 4.8,
      "deliveryTime": "30-45 min",
      "minOrder": 20,
      "deliveryFee": 5
    }
  ]
}
```

---

#### GET /firms/:id
Get firm details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "firm_1",
    "name": "AquaPure",
    "logo": "https://example.com/logos/aquapure.png",
    "rating": 4.8,
    "deliveryTime": "30-45 min",
    "minOrder": 20,
    "deliveryFee": 5
  }
}
```

---

### 5. Products

#### GET /products
Get products, optionally filtered by firm.

**Query Parameters:**
- `firmId` (optional): Filter products by firm

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1",
      "firmId": "firm_1",
      "name": "19L Water Bottle",
      "description": "Pure spring water",
      "price": 15,
      "image": "https://example.com/products/bottle-19l.png",
      "volume": "19L",
      "inStock": true
    }
  ]
}
```

---

#### GET /products/:id
Get product details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod_1",
    "firmId": "firm_1",
    "name": "19L Water Bottle",
    "description": "Pure spring water",
    "price": 15,
    "image": "https://example.com/products/bottle-19l.png",
    "volume": "19L",
    "inStock": true
  }
}
```

---

### 6. Orders

#### POST /orders
Create new order.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "items": [
    {
      "productId": "prod_1",
      "quantity": 2
    }
  ],
  "firmId": "firm_1",
  "addressId": "addr_1",
  "total": 35
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_123",
    "stage": "ORDER_PLACED",
    "items": [
      {
        "product": {
          "id": "prod_1",
          "name": "19L Water Bottle",
          "price": 15,
          "image": "https://example.com/products/bottle-19l.png",
          "volume": "19L"
        },
        "quantity": 2
      }
    ],
    "total": 35,
    "firm": {
      "id": "firm_1",
      "name": "AquaPure",
      "logo": "https://example.com/logos/aquapure.png"
    },
    "deliveryAddress": {
      "id": "addr_1",
      "title": "Home",
      "address": "123 Main St, Tashkent",
      "lat": 41.2995,
      "lng": 69.2401
    },
    "driver": null,
    "createdAt": "2025-01-15T10:30:00Z",
    "estimatedDelivery": "2025-01-15T11:00:00Z"
  }
}
```

---

#### GET /orders
Get user's order history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_123",
      "stage": "DELIVERED",
      "total": 35,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

#### GET /orders/:id
Get order details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_123",
    "stage": "COURIER_ON_THE_WAY",
    "items": [...],
    "total": 35,
    "firm": {...},
    "deliveryAddress": {...},
    "driver": {
      "id": "driver_1",
      "name": "Ali",
      "phone": "+998901234567",
      "photo": "https://example.com/drivers/ali.jpg",
      "rating": 4.9,
      "vehicleNumber": "01A123BC"
    },
    "createdAt": "2025-01-15T10:30:00Z",
    "estimatedDelivery": "2025-01-15T11:00:00Z"
  }
}
```

---

#### GET /orders/:id/status
Get order status.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "stage": "COURIER_ON_THE_WAY",
    "estimatedDelivery": "2025-01-15T11:00:00Z"
  }
}
```

---

#### GET /orders/:id/driver
Get driver information for order.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "driver_1",
    "name": "Ali",
    "phone": "+998901234567",
    "photo": "https://example.com/drivers/ali.jpg",
    "rating": 4.9,
    "vehicleNumber": "01A123BC"
  }
}
```

Returns `null` if no driver assigned yet.

---

#### POST /orders/:id/cancel
Cancel order.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 7. Location Services

#### POST /location/reverse-geocode
Get address from coordinates.

**Request:**
```json
{
  "lat": 41.2995,
  "lng": 69.2401
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "123 Main St, Tashkent, Uzbekistan"
  }
}
```

---

## Order Stages

The order lifecycle follows these stages:

1. `ORDER_PLACED` - Order has been placed
2. `IN_QUEUE` - Order is being prepared
3. `COURIER_ON_THE_WAY` - Driver is delivering the order
4. `DELIVERED` - Order has been delivered

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "errors": {
    "field": ["Error detail"]
  }
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Response Wrapper

All successful responses are wrapped in this format:

```json
{
  "success": true,
  "data": <actual_data>,
  "message": "Optional success message"
}
```

---

## Testing

The app currently uses mock data by default. To test with a real backend:

1. Update the `baseURL` in `/config/api.config.ts`
2. Set `useMockData: false` for your environment
3. Ensure your backend implements all endpoints above
4. Test authentication flow first
5. Verify token storage and refresh mechanism

---

## Security Notes

- Always use HTTPS in production
- Implement rate limiting on authentication endpoints
- Store refresh tokens securely
- Implement token rotation
- Add request signing for sensitive operations
- Validate all input on the backend
