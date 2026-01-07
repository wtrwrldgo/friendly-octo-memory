/**
 * HTTP Service
 *
 * Axios-based HTTP client with interceptors for authentication,
 * error handling, and request/response transformation.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';
import StorageService from './storage.service';

// Error response structure
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Success response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class HttpService {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token and language to headers
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await StorageService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Add Accept-Language header for translations
        const language = await StorageService.getLanguage();
        config.headers['Accept-Language'] = language || 'uz';
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request if token refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await StorageService.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Attempt to refresh token
            const response = await axios.post(
              `${API_CONFIG.baseURL}/auth/refresh-token`,
              { refreshToken }
            );

            const { token } = response.data;
            await StorageService.setAuthToken(token);

            // Retry all queued requests
            this.failedQueue.forEach((promise) => {
              promise.resolve(token);
            });
            this.failedQueue = [];

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Token refresh failed - clear storage and redirect to login
            this.failedQueue.forEach((promise) => {
              promise.reject(refreshError);
            });
            this.failedQueue = [];

            await StorageService.clearAll();
            // Note: Navigation should be handled at the app level
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    // Network error
    if (!error.response) {
      return {
        message: 'Network error. Please check your internet connection.',
        statusCode: 0,
      };
    }

    // Server returned error
    const response = error.response;
    const data: any = response.data;

    return {
      message: data?.message || 'An unexpected error occurred',
      statusCode: response.status,
      errors: data?.errors,
    };
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url, config);
    return response.data.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.post(
      url,
      data,
      config
    );
    return response.data.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(
      url,
      data,
      config
    );
    return response.data.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.delete(url, config);
    return response.data.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.patch(
      url,
      data,
      config
    );
    return response.data.data;
  }

  // Get raw axios instance for advanced use cases
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default new HttpService();
