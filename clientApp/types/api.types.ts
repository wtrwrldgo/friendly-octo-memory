/**
 * API Request and Response Types
 *
 * TypeScript interfaces for all API requests and responses
 */

import { User, OrderStage } from './index';

// ==================== Authentication ====================

export interface SendCodeRequest {
  phone: string;
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
}

export interface VerifyCodeRequest {
  phone: string;
  code: string;
}

export interface VerifyCodeResponse {
  token: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface LogoutResponse {
  success: boolean;
}

// ==================== User Management ====================

export interface UpdateUserRequest {
  name?: string;
  language?: string;
}

// ==================== Address Management ====================

export interface AddAddressRequest {
  title: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface UpdateAddressRequest {
  title?: string;
  address?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface DeleteAddressResponse {
  success: boolean;
}

// ==================== Orders ====================

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  firmId: string;
  addressId: string;
  total: number;
}

export interface OrderStatusResponse {
  stage: OrderStage;
  estimatedDelivery: Date;
}

export interface CancelOrderResponse {
  success: boolean;
}

// ==================== Location ====================

export interface ReverseGeocodeRequest {
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResponse {
  address: string;
}

// ==================== Generic API Response ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ==================== Query Parameters ====================

export interface ProductsQueryParams {
  firmId?: string;
}

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStage;
}

// ==================== List Responses ====================

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== Type Guards ====================

export function isApiError(response: any): response is ApiError {
  return response && response.success === false && 'message' in response;
}

export function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return response && response.success === true && 'data' in response;
}
