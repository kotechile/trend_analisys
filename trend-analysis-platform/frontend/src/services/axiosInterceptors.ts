/**
 * Enhanced Axios interceptors for authentication and error handling
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthTokens, User } from '../types/auth';
import { useNotifications } from '../components/common/NotificationSystem';

// =============================================================================
// INTERCEPTOR CONFIGURATION
// =============================================================================

export interface InterceptorConfig {
  baseURL: string;
  timeout: number;
  enableLogging: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableNotifications: boolean;
  enableOfflineSupport: boolean;
}

export interface TokenStorage {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
  isTokenExpired: (token: string) => boolean;
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

// =============================================================================
// REQUEST INTERCEPTOR
// =============================================================================

export class RequestInterceptor {
  private config: InterceptorConfig;
  private tokenStorage: TokenStorage;
  private authContext: AuthContext | null = null;

  constructor(config: InterceptorConfig, tokenStorage: TokenStorage) {
    this.config = config;
    this.tokenStorage = tokenStorage;
  }

  setAuthContext(authContext: AuthContext) {
    this.authContext = authContext;
  }

  onFulfilled = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Skip auth for certain endpoints
    if (this.shouldSkipAuth(config.url)) {
      return config;
    }

    // Add authentication header
    const token = this.tokenStorage.getAccessToken();
    if (token && !this.tokenStorage.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request metadata
    config.headers['X-Request-ID'] = this.generateRequestId();
    config.headers['X-Request-Time'] = Date.now().toString();
    config.headers['X-Client-Version'] = process.env.REACT_APP_VERSION || '1.0.0';

    // Add user context if available
    if (this.authContext?.user) {
      config.headers['X-User-ID'] = this.authContext.user.id;
      config.headers['X-User-Role'] = this.authContext.user.role;
    }

    // Log request in development
    if (this.config.enableLogging) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
        timestamp: new Date().toISOString()
      });
    }

    return config;
  };

  onRejected = (error: any): Promise<never> => {
    if (this.config.enableLogging) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  };

  private shouldSkipAuth(url?: string): boolean {
    if (!url) return false;
    
    const skipAuthEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/health',
      '/metrics'
    ];

    return skipAuthEndpoints.some(endpoint => url.includes(endpoint));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// =============================================================================
// RESPONSE INTERCEPTOR
// =============================================================================

export class ResponseInterceptor {
  private config: InterceptorConfig;
  private tokenStorage: TokenStorage;
  private authContext: AuthContext | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthTokens> | null = null;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(config: InterceptorConfig, tokenStorage: TokenStorage) {
    this.config = config;
    this.tokenStorage = tokenStorage;
  }

  setAuthContext(authContext: AuthContext) {
    this.authContext = authContext;
  }

  onFulfilled = (response: AxiosResponse): AxiosResponse => {
    // Log response in development
    if (this.config.enableLogging) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
        headers: response.headers,
        duration: this.calculateResponseTime(response),
        timestamp: new Date().toISOString()
      });
    }

    // Handle successful token refresh
    if (response.config.url?.includes('/auth/refresh') && response.data.tokens) {
      this.tokenStorage.setTokens(response.data.tokens);
    }

    return response;
  };

  onRejected = async (error: AxiosError): Promise<never> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (this.config.enableLogging) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        url: error.config?.url,
        timestamp: new Date().toISOString()
      });
    }

    // Handle different error types
    if (error.response?.status === 401 && !originalRequest._retry) {
      return this.handleAuthError(error, originalRequest);
    }

    if (error.response?.status === 422) {
      return this.handleValidationError(error);
    }

    if (error.response?.status && error.response.status >= 500) {
      return this.handleServerError(error);
    }

    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      return this.handleNetworkError(error);
    }

    return this.handleGenericError(error);
  };

  private async handleAuthError(error: AxiosError, originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }): Promise<never> {
    if (originalRequest._retry) {
      // Already tried to refresh, clear tokens and redirect
      this.tokenStorage.clearTokens();
      if (this.authContext) {
        await this.authContext.logout();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newTokens = await this.refreshAccessToken();
      this.tokenStorage.setTokens(newTokens);
      
      // Update the original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      }
      
      // Retry the original request
      return axios(originalRequest);
    } catch (refreshError) {
      this.tokenStorage.clearTokens();
      if (this.authContext) {
        await this.authContext.logout();
      }
      return Promise.reject(refreshError);
    }
  }

  private async handleValidationError(error: AxiosError): Promise<never> {
    const message = error.response?.data?.message || 'Validation failed. Please check your input.';
    
    if (this.config.enableNotifications) {
      // This would be called from a component that has access to notifications
      // For now, we'll just log it
      console.warn('Validation Error:', message);
    }

    return Promise.reject({
      type: 'VALIDATION_ERROR',
      message,
      status: 422,
      details: error.response?.data
    });
  }

  private async handleServerError(error: AxiosError): Promise<never> {
    const message = error.response?.data?.message || 'Server error occurred. Please try again later.';
    
    if (this.config.enableNotifications) {
      console.error('Server Error:', message);
    }

    return Promise.reject({
      type: 'SERVER_ERROR',
      message,
      status: error.response?.status || 500,
      details: error.response?.data
    });
  }

  private async handleNetworkError(error: AxiosError): Promise<never> {
    const message = 'Network connection failed. Please check your internet connection.';
    
    if (this.config.enableNotifications) {
      console.error('Network Error:', message);
    }

    return Promise.reject({
      type: 'NETWORK_ERROR',
      message,
      status: 0,
      details: { originalError: error.message }
    });
  }

  private async handleGenericError(error: AxiosError): Promise<never> {
    const message = error.message || 'An unexpected error occurred.';
    
    if (this.config.enableNotifications) {
      console.error('Generic Error:', message);
    }

    return Promise.reject({
      type: 'GENERIC_ERROR',
      message,
      status: error.response?.status || 500,
      details: error.response?.data
    });
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const tokens = await this.refreshPromise;
      this.processQueue(null, tokens);
      return tokens;
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<AuthTokens> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.config.baseURL}/api/v1/auth/refresh`, {
        refresh_token: refreshToken
      });

      const tokens: AuthTokens = response.data.tokens;
      this.tokenStorage.setTokens(tokens);
      
      return tokens;
    } catch (error) {
      this.tokenStorage.clearTokens();
      throw error;
    }
  }

  private processQueue(error: any, token: AuthTokens | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private calculateResponseTime(response: AxiosResponse): number {
    const requestTime = response.config.headers['X-Request-Time'];
    if (requestTime) {
      return Date.now() - parseInt(requestTime);
    }
    return 0;
  }
}

// =============================================================================
// INTERCEPTOR MANAGER
// =============================================================================

export class InterceptorManager {
  private axiosInstance: AxiosInstance;
  private requestInterceptor: RequestInterceptor;
  private responseInterceptor: ResponseInterceptor;
  private config: InterceptorConfig;
  private tokenStorage: TokenStorage;

  constructor(axiosInstance: AxiosInstance, config: InterceptorConfig, tokenStorage: TokenStorage) {
    this.axiosInstance = axiosInstance;
    this.config = config;
    this.tokenStorage = tokenStorage;
    
    this.requestInterceptor = new RequestInterceptor(config, tokenStorage);
    this.responseInterceptor = new ResponseInterceptor(config, tokenStorage);
    
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      this.requestInterceptor.onFulfilled,
      this.requestInterceptor.onRejected
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      this.responseInterceptor.onFulfilled,
      this.responseInterceptor.onRejected
    );
  }

  setAuthContext(authContext: AuthContext): void {
    this.requestInterceptor.setAuthContext(authContext);
    this.responseInterceptor.setAuthContext(authContext);
  }

  updateConfig(newConfig: Partial<InterceptorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  clearInterceptors(): void {
    this.axiosInstance.interceptors.request.clear();
    this.axiosInstance.interceptors.response.clear();
  }

  reinstallInterceptors(): void {
    this.clearInterceptors();
    this.setupInterceptors();
  }
}

// =============================================================================
// TOKEN STORAGE IMPLEMENTATIONS
// =============================================================================

export class LocalStorageTokenStorage implements TokenStorage {
  private accessTokenKey = 'trend_analysis_access_token';
  private refreshTokenKey = 'trend_analysis_refresh_token';

  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.accessTokenKey);
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch {
      return null;
    }
  }

  setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.accessTokenKey, tokens.accessToken);
      localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  clearTokens(): void {
    try {
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch {
      return true;
    }
  }
}

export class SessionStorageTokenStorage implements TokenStorage {
  private accessTokenKey = 'trend_analysis_access_token';
  private refreshTokenKey = 'trend_analysis_refresh_token';

  getAccessToken(): string | null {
    try {
      return sessionStorage.getItem(this.accessTokenKey);
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(this.refreshTokenKey);
    } catch {
      return null;
    }
  }

  setTokens(tokens: AuthTokens): void {
    try {
      sessionStorage.setItem(this.accessTokenKey, tokens.accessToken);
      sessionStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  clearTokens(): void {
    try {
      sessionStorage.removeItem(this.accessTokenKey);
      sessionStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch {
      return true;
    }
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createAxiosInstance(config: Partial<InterceptorConfig> = {}): AxiosInstance {
  const defaultConfig: InterceptorConfig = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: 30000,
    enableLogging: process.env.NODE_ENV === 'development',
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    enableNotifications: true,
    enableOfflineSupport: true,
    ...config
  };

  const axiosInstance = axios.create({
    baseURL: defaultConfig.baseURL,
    timeout: defaultConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return axiosInstance;
}

export function createInterceptorManager(
  axiosInstance: AxiosInstance,
  config: Partial<InterceptorConfig> = {},
  tokenStorage: TokenStorage = new LocalStorageTokenStorage()
): InterceptorManager {
  const defaultConfig: InterceptorConfig = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: 30000,
    enableLogging: process.env.NODE_ENV === 'development',
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    enableNotifications: true,
    enableOfflineSupport: true,
    ...config
  };

  return new InterceptorManager(axiosInstance, defaultConfig, tokenStorage);
}

// =============================================================================
// DEFAULT EXPORTS
// =============================================================================

export const defaultAxiosInstance = createAxiosInstance();
export const defaultTokenStorage = new LocalStorageTokenStorage();

// Lazy initialization to avoid issues during testing
let defaultInterceptorManager: InterceptorManager | null = null;

export function getDefaultInterceptorManager(): InterceptorManager {
  if (!defaultInterceptorManager) {
    defaultInterceptorManager = createInterceptorManager(defaultAxiosInstance);
  }
  return defaultInterceptorManager;
}

export default getDefaultInterceptorManager;
