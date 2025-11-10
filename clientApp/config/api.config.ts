/**
 * API Configuration
 *
 * Configure your backend API endpoints here.
 * Supports development, staging, and production environments.
 */

import Constants from 'expo-constants';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  useMockData: boolean;
}

// Environment-based configuration
const ENV = {
  development: {
    baseURL: 'http://localhost:3000/api', // Not used - Supabase direct connection
    timeout: 15000,
    useMockData: true, // Using mock data until database is ready
  },
  staging: {
    baseURL: 'https://staging-api.watergo.com/api', // Your staging API URL
    timeout: 15000,
    useMockData: false,
  },
  production: {
    baseURL: 'https://api.watergo.com/api', // Your production API URL
    timeout: 10000,
    useMockData: false,
  },
};

// Get current environment from expo-constants or default to development
const getEnvironment = (): keyof typeof ENV => {
  const releaseChannel = (Constants.expoConfig as any)?.releaseChannel;

  if (releaseChannel === 'production') return 'production';
  if (releaseChannel === 'staging') return 'staging';
  return 'development';
};

const currentEnv = getEnvironment();

// Export current configuration
export const API_CONFIG: ApiConfig = ENV[currentEnv];

// API Endpoints - Document expected request/response formats
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SEND_CODE: '/auth/send-code',          // POST { phone: string } -> { success: boolean, message: string }
    VERIFY_CODE: '/auth/verify-code',      // POST { phone: string, code: string } -> { token: string, user: User }
    REFRESH_TOKEN: '/auth/refresh-token',  // POST { refreshToken: string } -> { token: string }
    LOGOUT: '/auth/logout',                // POST -> { success: boolean }
  },

  // User Management
  USER: {
    PROFILE: '/user/profile',              // GET -> User
    UPDATE_PROFILE: '/user/profile',       // PUT { name?, language? } -> User
    ADDRESSES: '/user/addresses',          // GET -> Address[]
    ADD_ADDRESS: '/user/addresses',        // POST { title, address, lat, lng, isDefault } -> Address
    UPDATE_ADDRESS: '/user/addresses/:id', // PUT { title?, address?, lat?, lng?, isDefault? } -> Address
    DELETE_ADDRESS: '/user/addresses/:id', // DELETE -> { success: boolean }
  },

  // Firms (Vendors)
  FIRMS: {
    LIST: '/firms',                        // GET -> Firm[]
    DETAIL: '/firms/:id',                  // GET -> Firm
  },

  // Products
  PRODUCTS: {
    LIST: '/products',                     // GET ?firmId=xxx -> Product[]
    DETAIL: '/products/:id',               // GET -> Product
  },

  // Orders
  ORDERS: {
    CREATE: '/orders',                     // POST { items, firmId, addressId, total } -> Order
    LIST: '/orders',                       // GET -> Order[]
    DETAIL: '/orders/:id',                 // GET -> Order
    STATUS: '/orders/:id/status',          // GET -> { stage: OrderStage, estimatedDelivery: Date }
    DRIVER: '/orders/:id/driver',          // GET -> Driver | null
    CANCEL: '/orders/:id/cancel',          // POST -> { success: boolean }
  },

  // Location Services
  LOCATION: {
    REVERSE_GEOCODE: '/location/reverse-geocode', // POST { lat, lng } -> { address: string }
  },
} as const;

// Toggle mock data mode at runtime (useful for testing)
let useMockDataOverride: boolean | null = null;

export const setUseMockData = (useMock: boolean) => {
  useMockDataOverride = useMock;
};

export const shouldUseMockData = (): boolean => {
  return useMockDataOverride !== null
    ? useMockDataOverride
    : API_CONFIG.useMockData;
};
