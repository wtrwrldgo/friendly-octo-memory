# API Usage Examples

This document shows practical examples of using the API service layer in different scenarios.

## Basic API Calls

### Using Direct API Service

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import ApiService from '../services/api';
import { Firm } from '../types';

const VendorsScreen: React.FC = () => {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFirms();
  }, []);

  const loadFirms = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getFirms();
      setFirms(data);
    } catch (error) {
      console.error('Failed to load firms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlatList
      data={firms}
      refreshing={loading}
      onRefresh={loadFirms}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
};
```

---

## Using the useApi Hook

### Simple GET Request

```typescript
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useApi } from '../hooks/useApi';
import ApiService from '../services/api';

const VendorsScreen: React.FC = () => {
  const { data: firms, loading, error, execute } = useApi(
    () => ApiService.getFirms(),
    { immediate: true }  // Load on mount
  );

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <FlatList
      data={firms || []}
      refreshing={loading}
      onRefresh={execute}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
};
```

### GET Request with Parameters

```typescript
import React from 'react';
import { useApi } from '../hooks/useApi';
import ApiService from '../services/api';

const ProductsScreen: React.FC<{ firmId: string }> = ({ firmId }) => {
  const { data: products, loading, error } = useApi(
    () => ApiService.getProducts(firmId),
    { immediate: true }
  );

  // Component render...
};
```

### Lazy Loading (Execute on Demand)

```typescript
const SearchScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, execute } = useApi(
    (term: string) => ApiService.searchProducts(term)
  );

  const handleSearch = async () => {
    if (searchTerm) {
      await execute(searchTerm);
    }
  };

  return (
    <View>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch}
      />
      {/* Results... */}
    </View>
  );
};
```

---

## Using the useMutation Hook

### Create Order

```typescript
import React from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '../hooks/useApi';
import ApiService from '../services/api';
import { CreateOrderRequest } from '../types';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();

  const { mutate: createOrder, loading } = useMutation(
    (orderData: CreateOrderRequest) => ApiService.createOrder(orderData),
    {
      onSuccess: (order) => {
        // Navigate to order tracking
        navigation.navigate('OrderTracking', { orderId: order.id });
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    }
  );

  const handleCheckout = async () => {
    await createOrder({
      items: [{ productId: 'prod_1', quantity: 2 }],
      firmId: 'firm_1',
      addressId: 'addr_1',
      total: 30.00,
    });
  };

  return (
    <PrimaryButton
      title="Place Order"
      onPress={handleCheckout}
      loading={loading}
    />
  );
};
```

### Update User Profile

```typescript
import { useMutation } from '../hooks/useApi';
import ApiService from '../services/api';

const ProfileEditScreen: React.FC = () => {
  const [name, setName] = useState('');

  const { mutate: updateProfile, loading } = useMutation(
    (updates) => ApiService.updateUserProfile(updates),
    {
      onSuccess: (user) => {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      },
    }
  );

  const handleSave = () => {
    updateProfile({ name });
  };

  return (
    <View>
      <TextField value={name} onChangeText={setName} />
      <PrimaryButton
        title="Save"
        onPress={handleSave}
        loading={loading}
      />
    </View>
  );
};
```

---

## Authentication Flow

### Phone Authentication

```typescript
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useMutation } from '../hooks/useApi';
import ApiService from '../services/api';

const AuthPhoneScreen: React.FC = ({ navigation }) => {
  const [phone, setPhone] = useState('');

  const { mutate: sendCode, loading } = useMutation(
    (phone: string) => ApiService.sendVerificationCode(phone),
    {
      onSuccess: (result) => {
        Alert.alert('Success', result.message);
        navigation.navigate('VerifyCode', { phone });
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    }
  );

  const handleSendCode = () => {
    sendCode(phone);
  };

  return (
    <View>
      <PhoneInput value={phone} onChangeText={setPhone} />
      <PrimaryButton
        title="Send Code"
        onPress={handleSendCode}
        loading={loading}
      />
    </View>
  );
};
```

### Code Verification

```typescript
const VerifyCodeScreen: React.FC = ({ route, navigation }) => {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const { setUser } = useUser();

  const { mutate: verify, loading } = useMutation(
    (code: string) => ApiService.verifyCode(phone, code),
    {
      onSuccess: ({ user, token }) => {
        // Token is automatically stored by ApiService
        setUser(user);
        navigation.navigate('EnableLocation');
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    }
  );

  return (
    <View>
      <TextField value={code} onChangeText={setCode} />
      <PrimaryButton
        title="Verify"
        onPress={() => verify(code)}
        loading={loading}
      />
    </View>
  );
};
```

---

## Context Integration

### UserContext with API

```typescript
import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/api';
import StorageService from '../services/storage.service';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount (check if logged in)
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await StorageService.getAuthToken();
      if (token) {
        const userData = await ApiService.getUserProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, code: string) => {
    const { user, token } = await ApiService.verifyCode(phone, code);
    setUser(user);
  };

  const logout = async () => {
    await ApiService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const updatedUser = await ApiService.updateUserProfile(updates);
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
```

---

## Pagination Example

### Infinite Scroll Orders

```typescript
import React from 'react';
import { FlatList } from 'react-native';
import { usePaginatedApi } from '../hooks/useApi';
import ApiService from '../services/api';

const OrderHistoryScreen: React.FC = () => {
  const { data: orders, loading, loadMore, hasMore, refresh } = usePaginatedApi(
    (page, limit) => ApiService.getOrders(page, limit),
    20  // Items per page
  );

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => <OrderCard order={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={refresh}
      ListFooterComponent={
        loading ? <ActivityIndicator /> : null
      }
    />
  );
};
```

---

## Error Handling Patterns

### Global Error Handler

```typescript
import { Alert } from 'react-native';

const handleApiError = (error: Error) => {
  // Log to analytics
  console.error('API Error:', error);

  // Show user-friendly message
  if (error.message.includes('network')) {
    Alert.alert('No Internet', 'Please check your connection');
  } else if (error.message.includes('unauthorized')) {
    // Navigate to login
    navigation.navigate('Login');
  } else {
    Alert.alert('Error', error.message);
  }
};

// Usage
const { data, error } = useApi(
  () => ApiService.getFirms(),
  {
    immediate: true,
    onError: handleApiError
  }
);
```

### Retry Logic

```typescript
const useApiWithRetry = <T,>(
  apiFunction: () => Promise<T>,
  maxRetries: number = 3
) => {
  const [retries, setRetries] = useState(0);

  const { data, loading, error, execute } = useApi(apiFunction);

  useEffect(() => {
    if (error && retries < maxRetries) {
      setTimeout(() => {
        setRetries(retries + 1);
        execute();
      }, 1000 * Math.pow(2, retries)); // Exponential backoff
    }
  }, [error, retries]);

  return { data, loading, error, retry: execute };
};
```

---

## Real-time Order Tracking

### Polling Order Status

```typescript
const OrderTrackingScreen: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Poll order status every 10 seconds
    const pollInterval = setInterval(async () => {
      try {
        const status = await ApiService.getOrderStatus(orderId);
        setOrder((prev) => prev ? { ...prev, stage: status.stage } : null);

        // Stop polling if delivered
        if (status.stage === OrderStage.DELIVERED) {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Failed to poll order status:', error);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [orderId]);

  return <OrderTracker order={order} />;
};
```

---

## Testing with Mock vs Real API

### Toggle in Settings

```typescript
import { setUseMockData } from '../config/api.config';
import ApiService from '../services/api';

const DeveloperSettingsScreen: React.FC = () => {
  const [useMock, setUseMock] = useState(ApiService.isUsingMockData());

  const toggleMockData = () => {
    const newValue = !useMock;
    setUseMockData(newValue);
    setUseMock(newValue);
    Alert.alert(
      'API Mode Changed',
      `Now using ${newValue ? 'MOCK' : 'REAL'} API. Restart the app.`
    );
  };

  return (
    <Switch
      value={useMock}
      onValueChange={toggleMockData}
      label="Use Mock Data"
    />
  );
};
```

---

## Optimistic Updates

### Update Cart Optimistically

```typescript
const useOptimisticCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = async (product: Product) => {
    // Optimistically update UI
    const optimisticCart = [...cart, { product, quantity: 1 }];
    setCart(optimisticCart);

    try {
      // Sync with backend
      await ApiService.updateCart(optimisticCart);
    } catch (error) {
      // Rollback on error
      setCart(cart);
      Alert.alert('Error', 'Failed to update cart');
    }
  };

  return { cart, addToCart };
};
```

---

## Caching Strategy

### Cache Vendors Data

```typescript
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCachedFirms = () => {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFirms();
  }, []);

  const loadFirms = async () => {
    try {
      // Try to load from cache first
      const cached = await AsyncStorage.getItem('firms_cache');
      if (cached) {
        setFirms(JSON.parse(cached));
      }

      // Fetch fresh data
      const fresh = await ApiService.getFirms();
      setFirms(fresh);

      // Update cache
      await AsyncStorage.setItem('firms_cache', JSON.stringify(fresh));
    } catch (error) {
      console.error('Failed to load firms:', error);
    } finally {
      setLoading(false);
    }
  };

  return { firms, loading, refresh: loadFirms };
};
```

---

## Form Submission

### Complete Form with Validation

```typescript
const AddAddressScreen: React.FC = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: addAddress, loading } = useMutation(
    (data) => ApiService.addAddress(data),
    {
      onSuccess: (newAddress) => {
        Alert.alert('Success', 'Address added successfully');
        navigation.goBack();
      },
      onError: (error) => {
        if (error.errors) {
          setErrors(error.errors);
        } else {
          Alert.alert('Error', error.message);
        }
      },
    }
  );

  const handleSubmit = () => {
    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!title) newErrors.title = 'Title is required';
    if (!address) newErrors.address = 'Address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addAddress({
      title,
      address,
      lat: 41.2995,
      lng: 69.2401,
      isDefault: false,
    });
  };

  return (
    <View>
      <TextField
        label="Title"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />
      <TextField
        label="Address"
        value={address}
        onChangeText={setAddress}
        error={errors.address}
      />
      <PrimaryButton
        title="Save Address"
        onPress={handleSubmit}
        loading={loading}
      />
    </View>
  );
};
```

These examples cover most common use cases. Refer to the API_INTEGRATION_GUIDE.md for more details.
