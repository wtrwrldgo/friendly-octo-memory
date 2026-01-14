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
  useLocalBackend: boolean;
}

// Get the correct localhost URL based on platform
// - iOS Simulator: localhost works
// - Android Emulator: 10.0.2.2 (special alias for host machine)
// - Physical device: use your computer's IP address
//
// Production VPS URL
const VPS_URL = 'https://api.watergocrm.uz';

const getLocalBackendUrl = () => {
  return `${VPS_URL}/api`;
};

// Environment-based configuration
const ENV = {
  development: {
    baseURL: getLocalBackendUrl(),
    timeout: 15000,
    useMockData: false,
    useLocalBackend: true, // ✅ USE LOCAL POSTGRESQL BACKEND
  },
  staging: {
    baseURL: 'https://staging-api.watergo.com/api',
    timeout: 15000,
    useMockData: false,
    useLocalBackend: false,
  },
  production: {
    baseURL: 'https://api.watergocrm.uz/api',
    timeout: 10000,
    useMockData: false,
    useLocalBackend: false,
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

// Debug log at startup
console.log('[API_CONFIG] Environment:', currentEnv);
console.log('[API_CONFIG] useLocalBackend:', API_CONFIG.useLocalBackend);
console.log('[API_CONFIG] useMockData:', API_CONFIG.useMockData);

// API Endpoints - Document expected request/response formats
export const API_ENDPOINTS = {
  // Authentication (mobile routes)
  AUTH: {
    SEND_CODE: '/auth/mobile/send-code',          // POST { phone: string } -> { success: boolean, message: string }
    VERIFY_CODE: '/auth/mobile/verify-code',      // POST { phone: string, code: string } -> { token: string, user: User }
    REFRESH_TOKEN: '/auth/mobile/refresh',        // POST { refreshToken: string } -> { token: string }
    LOGOUT: '/auth/mobile/logout',                // POST -> { success: boolean }
  },

  // User Management (mobile auth routes)
  USER: {
    PROFILE: '/auth/mobile/profile',       // GET -> User
    UPDATE_PROFILE: '/auth/mobile/profile', // PUT { name?, language? } -> User
    ADDRESSES: '/addresses',               // GET -> Address[]
    ADD_ADDRESS: '/addresses',             // POST { title, address, lat, lng, isDefault } -> Address
    UPDATE_ADDRESS: '/addresses/:id',      // PUT { title?, address?, lat?, lng?, isDefault? } -> Address
    DELETE_ADDRESS: '/addresses/:id',      // DELETE -> { success: boolean }
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

// Check if should use local backend
let useLocalBackendOverride: boolean | null = null;

export const setUseLocalBackend = (useLocal: boolean) => {
  useLocalBackendOverride = useLocal;
};

export const shouldUseLocalBackend = (): boolean => {
  return useLocalBackendOverride !== null
    ? useLocalBackendOverride
    : API_CONFIG.useLocalBackend;
};
