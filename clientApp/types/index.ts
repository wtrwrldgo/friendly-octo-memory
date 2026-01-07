// User Types
export type PaymentMethodType = 'cash' | 'card' | 'wallet';

export interface User {
  id?: string;
  name?: string;
  phone?: string;
  language?: string;
  defaultPaymentMethod?: PaymentMethodType;
}

export interface Address {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  addressType?: 'house' | 'apartment' | 'government' | 'office';
  name?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  intercom?: string;
  comment?: string;
}

// Firm & Product Types
export interface Firm {
  id: string;
  name: string;
  logo: string | number;
  rating: number;
  deliveryTime: string;
  minOrder: number;
  minOrderEnabled?: boolean;
  deliveryFee: number;
  deliveryFeeEnabled?: boolean;
  bottleDeposit: number;
  bottleDepositEnabled?: boolean;
  bottleDepositPrice?: number;
  scheduleDaysLimit?: number;
  scheduleTimeInterval?: number;
  homeBanner?: string | number;
  homeBannerUrl?: string;
  detailBanner?: string | number;
  detailBannerUrl?: string;
  logoUrl?: string;
  location?: string;
  phone?: string;
  promotions?: Array<{
    label: string;
    value: string;
    color: 'green' | 'blue';
  }>;
}

export interface Product {
  id: string;
  firmId: string;
  name: string;
  name_en?: string;
  name_ru?: string;
  name_uz?: string;
  name_kaa?: string;
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
  COURIER_ARRIVED = 'COURIER_ARRIVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  photo: string;
  rating: number;
  vehicleNumber: string;
  carBrand?: string;
  carColor?: string;
  company: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  stage: OrderStage;
  items: CartItem[];
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  serviceFee?: number;
  firm: Firm;
  deliveryAddress: Address;
  driver: Driver | null;
  createdAt: Date;
  estimatedDelivery: Date;
  queuePosition?: number; // Position in queue (e.g., 3 for "3rd in queue")
  ordersAhead?: number; // Number of orders before this one (e.g., 2)
  reviewed?: boolean; // Whether the order has been reviewed
  preferredDeliveryTime?: Date | string | null;
  paymentMethod?: 'cash' | 'card' | 'wallet';
}

// Review Types
export interface Review {
  id: string;
  orderId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
}

// Language Types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Navigation Types
export type AuthStackParamList = {
  Welcome: undefined;
  SelectLanguage: undefined;
  AskName: undefined;
  AuthPhone: undefined;
  VerifyCode: { phone: string; autoCode?: string };
  AddressSelect: undefined;
  SelectAddress: { isFirstAddress?: boolean } | undefined;
  AddressType: { addressData: any };
  HouseDetails: { addressData: any };
  ApartmentDetails: { addressData: any };
  OfficeDetails: { addressData: any };
  GovernmentDetails: { addressData: any };
  AddressSummary: { addressData: any };
  CityNotSupported: undefined;
  Loading: undefined;
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
