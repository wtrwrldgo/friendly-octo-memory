// User Types
export interface User {
  id: string;
  name: string;
  phone: string;
  language: string;
}

export interface Address {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

// Firm & Product Types
export interface Firm {
  id: string;
  name: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
}

export interface Product {
  id: string;
  firmId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  volume: string;
  inStock: boolean;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  firm: Firm | null;
}

// Order Types
export enum OrderStage {
  ORDER_PLACED = 'ORDER_PLACED',
  IN_QUEUE = 'IN_QUEUE',
  COURIER_ON_THE_WAY = 'COURIER_ON_THE_WAY',
  DELIVERED = 'DELIVERED'
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  photo: string;
  rating: number;
  vehicleNumber: string;
}

export interface Order {
  id: string;
  stage: OrderStage;
  items: CartItem[];
  total: number;
  firm: Firm;
  deliveryAddress: Address;
  driver: Driver | null;
  createdAt: Date;
  estimatedDelivery: Date;
}

// Language Types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// Navigation Types
export type AuthStackParamList = {
  Loading: undefined;
  Welcome: undefined;
  SelectLanguage: undefined;
  AskName: undefined;
  AuthPhone: undefined;
  VerifyCode: { phone: string };
  EnableLocation: undefined;
  AddressSelect: undefined;
  SelectAddress: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  FirmDetails: { firm: Firm };
  Cart: undefined;
  OrderTracking: { orderId: string };
  Profile: undefined;
  SelectAddress: undefined;
  PaymentMethod: { onSelect?: (method: string) => void };
};

// Export API types
export * from './api.types';

// Export Geocoding types
export * from './geocoding.types';
