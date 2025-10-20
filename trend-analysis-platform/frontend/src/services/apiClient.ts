/**
 * API client with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResult, ApiError } from '../types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 90000; // 90 seconds to allow for LLM processing

// Token management
class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('trendtap_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('trendtap_token');
    }
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('trendtap_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      const token = TokenManager.getInstance().getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        TokenManager.getInstance().clearToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// API Client class
export class ApiClient {
  private client: AxiosInstance;
  private tokenManager: TokenManager;

  constructor() {
    this.client = createApiClient();
    this.tokenManager = TokenManager.getInstance();
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
    try {
      const response = await this.client.request<T>(config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  setAuthToken(token: string): void {
    this.tokenManager.setToken(token);
  }

  clearAuthToken(): void {
    this.tokenManager.clearToken();
  }

  isAuthenticated(): boolean {
    return this.tokenManager.isAuthenticated();
  }
}

export const apiClient = new ApiClient();
export const tokenManager = TokenManager.getInstance();