// Order Stage Enum
export enum OrderStage {
  ORDER_PLACED = 'ORDER_PLACED',
  IN_QUEUE = 'IN_QUEUE',
  COURIER_ON_THE_WAY = 'COURIER_ON_THE_WAY',
  COURIER_ARRIVED = 'COURIER_ARRIVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Order Type Enum
export enum OrderType {
  GOVERNMENT = 'Government',
  APARTMENT = 'Apartment',
  HOUSE = 'House',
  OFFICE = 'Office',
}

// Driver Status Type
export type DriverStatus = 'active' | 'inactive' | 'deleted';

// Driver Types
export interface Driver {
  id: string;
  name: string;
  phone: string;
  photo_url: string | null;
  rating: number;
  driver_number: number | null; // Driver identification number (e.g., 1, 10, 25)
  vehicle_number: string;
  vehicle_model: string | null;
  vehicle_brand: string | null;
  vehicle_color: string | null;
  is_available: boolean;
  is_active: boolean;
  status?: DriverStatus; // Driver account status (active, inactive, deleted)
  current_latitude: number | null;
  current_longitude: number | null;
  role: string;
  district: string | null; // District where driver works
  firm_id: string | null; // Firm/company ID
  firm_name: string | null; // Firm/company name
  firm_logo_url: string | null; // Firm/company logo URL
  // Driver Documents (for future use)
  driver_license_photo: string | null;
  driver_id_photo: string | null;
  vehicle_documents_photo: string | null;
}

// Customer Address
export interface Address {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: OrderType;
}

// Product in Order
export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

// Order
export interface Order {
  id: string;
  order_number: string;
  stage: OrderStage;
  total: number;
  delivery_fee: number;
  payment_method: string;
  payment_status: string;

  // Customer info
  customer_name: string;
  customer_phone: string;
  delivery_address: Address;

  // Order items
  items: OrderItem[];

  // Firm info
  firm_name: string;
  firm_phone: string;

  // Timestamps
  created_at: Date;
  estimated_delivery: Date | null;
  delivered_at: Date | null;
}

// Earnings
export interface Earnings {
  today: number;
  week: number;
  month: number;
  total_deliveries: number;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Loading: undefined;
  Welcome: undefined;
  AuthPhone: undefined;
  VerifyCode: { phone: string };
  AskName: undefined;
  Main: undefined;
  OrderDetails: { orderId: string };
  Navigation: { order: Order };
  Statistics: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  NoInternet: undefined;
};

export type MainTabParamList = {
  Orders: undefined;
  History: undefined;
  Earnings: undefined;
  Profile: undefined;
};
