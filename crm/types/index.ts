// file: types/index.ts

export type FirmStatus = "ACTIVE" | "SUSPENDED" | "DRAFT" | "PENDING_REVIEW";
export type DriverStatus = "ONLINE" | "OFFLINE" | "DELIVERING";
export type OrderStatus = "PENDING" | "ASSIGNED" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED" | "DELIVERING" | "CONFIRMED" | "PREPARING";
export type StaffRole = "OPERATOR" | "MANAGER" | "OWNER";
export type AccountType = "PLATFORM_ADMIN" | "FIRM_OWNER";
export type ClientType = "B2B" | "B2C" | "B2G";

export interface Firm {
  id: string;
  name: string;
  city: string;
  status: FirmStatus;
  clientsCount: number;
  ordersCount: number;
  driversCount: number;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  logoUrl?: string;
  isVisibleInClientApp?: boolean;
  description?: string;
  rejectionReason?: string;
  phone?: string;
  email?: string;
  productsCount?: number;
  bottleDepositEnabled?: boolean;
  bottleDepositPrice?: number;
  rating?: number;
  deliveryTime?: string;
  minOrder?: number;
  deliveryFee?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  firmId: string;
  firmName?: string;
  status: DriverStatus;
  carPlate: string;
  city?: string;
  isOnline?: boolean;
  driverNumber?: number;
  vehicleNumber?: string;
  lastSeenAt?: string;
  lastLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Order {
  id: string;
  firmId: string;
  firmName?: string;
  clientName: string;
  clientPhone?: string;
  address: string;
  status: OrderStatus;
  createdAt: string;
  total?: number;
  driverId?: string;
  driverName?: string;
  items?: OrderItem[];
  orderNumber?: number;
  assignedAt?: string;
  deliveredAt?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  firmId: string;
  type: ClientType;
  totalOrders: number;
  revenue: number;
  createdAt: string;
  lastOrderAt?: string;
}

export interface Vehicle {
  id: string;
  firmId: string;
  model: string;
  plateNumber: string;
  driverId: string | null;
  driverName?: string | null;
}

export interface Staff {
  id: string;
  firmId: string;
  name: string;
  role: StaffRole;
  phone: string;
  email?: string;
  city?: string;
  active: boolean;
  createdAt: string;
}

export interface GlobalStats {
  totalRevenue: number;
  totalOrders: number;
  activeFirms: number;
  activeDrivers: number;
}

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
  active: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface FirmAccount {
  id: string;
  firmId: string;
  firmName: string;
  email: string;
  ownerName: string;
  ownerPhone: string;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface Region {
  id: string;
  firmId: string;
  city: string;
  districts: District[];
  activeDrivers: number;
  totalOrders: number;
  revenue: number;
}

export interface District {
  id: string;
  name: string;
  regionId: string;
  deliveryFee: number;
  estimatedTime: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  firmId: string;
  type: "REVENUE" | "EXPENSE";
  category: string;
  amount: number;
  description: string;
  date: string;
  orderId?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
}

export interface Product {
  id: string;
  firmId: string;
  name: string;
  description: string;
  price: number;
  unit: string; // "bottle", "pack", "carton"
  volume: string; // "19L", "5L", "1.5L", etc.
  image?: string;
  inStock: boolean;
  stockQuantity: number;
  minOrder: number;
  category: "Water" | "Accessories" | "Equipment";
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}
