/**
 * User Service for the Trend Analysis Platform frontend.
 * 
 * This service provides comprehensive user management functionality including
 * profile management, preferences, activity tracking, session management, and administration.
 */

import { ApiClient } from './apiClient';
import {
  UserProfile,
  UserProfileUpdate,
  UserProfileResponse,
  UserPreferences,
  UserPreferencesResponse,
  UserActivity,
  UserActivityResponse,
  UserStats,
  UserStatsResponse,
  UserAnalytics,
  UserSessionsResponse,
  UserListResponse,
  UserSearchResult,
  UserExportOptions,
  UserImportOptions,
  UserBackup,
  UserEvent,
  UserNotification,
  ApiError,
  ApiResponse,
  PaginationInfo,
  UserFilters
} from '../types/user';

// =============================================================================
// USER SERVICE CONFIGURATION
// =============================================================================

export interface UserServiceConfig {
  apiClient: ApiClient;
  enableCaching: boolean;
  cacheTimeout: number;
  enableOfflineSupport: boolean;
  enableActivityTracking: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableBackup: boolean;
}

// =============================================================================
// USER SERVICE INTERFACE
// =============================================================================

export interface IUserService {
  // Profile Management
  getCurrentUser(): UserProfile | null;
  updateProfile(data: UserProfileUpdate): Promise<UserProfileResponse>;
  refreshUser(): Promise<UserProfile>;
  deleteProfile(): Promise<ApiResponse>;
  
  // Preferences Management
  getPreferences(): Promise<UserPreferencesResponse>;
  updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferencesResponse>;
  resetPreferences(): Promise<UserPreferencesResponse>;
  
  // Activity Management
  getActivities(page?: number, limit?: number): Promise<UserActivityResponse>;
  getActivityAnalytics(period: string): Promise<UserAnalytics>;
  trackActivity(type: string, description: string, metadata?: Record<string, any>): Promise<void>;
  
  // Statistics and Analytics
  getUserStats(): Promise<UserStatsResponse>;
  getAnalytics(period: string): Promise<UserAnalytics>;
  
  // Session Management
  getUserSessions(): Promise<UserSessionsResponse>;
  revokeSession(sessionId: string): Promise<ApiResponse>;
  revokeAllSessions(): Promise<ApiResponse>;
  
  // Search and Discovery
  searchUsers(query: string, filters?: UserFilters): Promise<UserSearchResult[]>;
  getUserSuggestions(query: string): Promise<UserSearchResult[]>;
  
  // Export and Import
  exportUserData(options: UserExportOptions): Promise<Blob>;
  importUserData(file: File, options: UserImportOptions): Promise<ApiResponse>;
  
  // Backup and Restore
  createBackup(): Promise<UserBackup>;
  restoreBackup(backup: UserBackup): Promise<ApiResponse>;
  
  // Notifications
  getNotifications(): Promise<UserNotification[]>;
  markNotificationAsRead(notificationId: string): Promise<ApiResponse>;
  markAllNotificationsAsRead(): Promise<ApiResponse>;
  deleteNotification(notificationId: string): Promise<ApiResponse>;
  
  // Events and Monitoring
  emitEvent(event: UserEvent): Promise<void>;
  getEventHistory(): Promise<UserEvent[]>;
  
  // Utility Methods
  clearCache(): void;
  refreshAllData(): Promise<void>;
  isOnline(): boolean;
  getServiceHealth(): Promise<boolean>;
}

// =============================================================================
// USER SERVICE IMPLEMENTATION
// =============================================================================

export class UserService implements IUserService {
  private config: UserServiceConfig;
  private apiClient: ApiClient;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private currentUser: UserProfile | null = null;
  private isOnlineStatus: boolean = navigator.onLine;

  constructor(config: UserServiceConfig) {
    this.config = config;
    this.apiClient = config.apiClient;
    
    // Setup online/offline listeners
    this.setupOnlineListeners();
    
    // Load current user from storage
    this.loadCurrentUser();
  }

  // =============================================================================
  // PROFILE MANAGEMENT
  // =============================================================================

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  async updateProfile(data: UserProfileUpdate): Promise<UserProfileResponse> {
    try {
      const response = await this.apiClient.put<UserProfileResponse>('/api/v1/users/profile', data);
      
      // Update local user data
      if (response.user) {
        this.currentUser = response.user;
        this.saveCurrentUser();
        this.clearCache(); // Clear cache when user data changes
      }
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async refreshUser(): Promise<UserProfile> {
    try {
      const response = await this.apiClient.get<{ user: UserProfile }>('/api/v1/users/profile');
      this.currentUser = response.user;
      this.saveCurrentUser();
      return response.user;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async deleteProfile(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.delete<ApiResponse>('/api/v1/users/profile');
      
      // Clear local data
      this.currentUser = null;
      this.clearCache();
      localStorage.removeItem('trend_analysis_user');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  // =============================================================================
  // PREFERENCES MANAGEMENT
  // =============================================================================

  async getPreferences(): Promise<UserPreferencesResponse> {
    const cacheKey = 'user_preferences';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.apiClient.get<UserPreferencesResponse>('/api/v1/users/preferences');
      
      // Cache the response
      if (this.config.enableCaching) {
        this.setCachedData(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferencesResponse> {
    try {
      const response = await this.apiClient.put<UserPreferencesResponse>('/api/v1/users/preferences', data);
      
      // Clear preferences cache
      this.clearCacheByPattern('user_preferences');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async resetPreferences(): Promise<UserPreferencesResponse> {
    try {
      const response = await this.apiClient.post<UserPreferencesResponse>('/api/v1/users/preferences/reset');
      
      // Clear preferences cache
      this.clearCacheByPattern('user_preferences');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  // =============================================================================
  // ACTIVITY MANAGEMENT
  // =============================================================================

  async getActivities(page: number = 1, limit: number = 20): Promise<UserActivityResponse> {
    const cacheKey = `user_activities_${page}_${limit}`;
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.apiClient.get<UserActivityResponse>('/api/v1/users/activities', {
        params: { page, limit }
      });
      
      // Cache the response
      if (this.config.enableCaching) {
        this.setCachedData(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async getActivityAnalytics(period: string): Promise<UserAnalytics> {
    const cacheKey = `user_analytics_${period}`;
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.apiClient.get<UserAnalytics>(`/api/v1/users/analytics/${period}`);
      
      // Cache the response
      if (this.config.enableCaching) {
        this.setCachedData(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async trackActivity(type: string, description: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.config.enableActivityTracking) {
      return;
    }

    try {
      await this.apiClient.post('/api/v1/users/activities', {
        type,
        description,
        metadata: metadata || {}
      });
    } catch (error) {
      // Don't throw error for activity tracking failures
      console.warn('Failed to track activity:', error);
    }
  }

  // =============================================================================
  // STATISTICS AND ANALYTICS
  // =============================================================================

  async getUserStats(): Promise<UserStatsResponse> {
    const cacheKey = 'user_stats';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.apiClient.get<UserStatsResponse>('/api/v1/users/stats');
      
      // Cache the response
      if (this.config.enableCaching) {
        this.setCachedData(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async getAnalytics(period: string): Promise<UserAnalytics> {
    return this.getActivityAnalytics(period);
  }

  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  async getUserSessions(): Promise<UserSessionsResponse> {
    const cacheKey = 'user_sessions';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.apiClient.get<UserSessionsResponse>('/api/v1/users/sessions');
      
      // Cache the response
      if (this.config.enableCaching) {
        this.setCachedData(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async revokeSession(sessionId: string): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.delete<ApiResponse>(`/api/v1/users/sessions/${sessionId}`);
      
      // Clear sessions cache
      this.clearCacheByPattern('user_sessions');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async revokeAllSessions(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.delete<ApiResponse>('/api/v1/users/sessions');
      
      // Clear sessions cache
      this.clearCacheByPattern('user_sessions');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  // =============================================================================
  // SEARCH AND DISCOVERY
  // =============================================================================

  async searchUsers(query: string, filters?: UserFilters): Promise<UserSearchResult[]> {
    try {
      const response = await this.apiClient.get<UserSearchResult[]>('/api/v1/users/search', {
        params: { q: query, ...filters }
      });
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async getUserSuggestions(query: string): Promise<UserSearchResult[]> {
    try {
      const response = await this.apiClient.get<UserSearchResult[]>('/api/v1/users/suggestions', {
        params: { q: query }
      });
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  // =============================================================================
  // EXPORT AND IMPORT
  // =============================================================================

  async exportUserData(options: UserExportOptions): Promise<Blob> {
    try {
      const response = await this.apiClient.post('/api/v1/users/export', options, {
        responseType: 'blob'
      });
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async importUserData(file: File, options: UserImportOptions): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));
      
      const response = await this.apiClient.post<ApiResponse>('/api/v1/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Clear cache after import
      this.clearCache();
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  // =============================================================================
  // BACKUP AND RESTORE
  // =============================================================================

  async createBackup(): Promise<UserBackup> {
    try {
      const response = await this.apiClient.post<UserBackup>('/api/v1/users/backup');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async restoreBackup(backup: UserBackup): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.post<ApiResponse>('/api/v1/users/restore', backup);
      
      // Clear cache after restore
      this.clearCache();
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  // =============================================================================
  // NOTIFICATIONS
  // =============================================================================

  async getNotifications(): Promise<UserNotification[]> {
    const cacheKey = 'user_notifications';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.apiClient.get<UserNotification[]>('/api/v1/users/notifications');
      
      // Cache the response
      if (this.config.enableCaching) {
        this.setCachedData(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.put<ApiResponse>(`/api/v1/users/notifications/${notificationId}/read`);
      
      // Clear notifications cache
      this.clearCacheByPattern('user_notifications');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.put<ApiResponse>('/api/v1/users/notifications/read-all');
      
      // Clear notifications cache
      this.clearCacheByPattern('user_notifications');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.delete<ApiResponse>(`/api/v1/users/notifications/${notificationId}`);
      
      // Clear notifications cache
      this.clearCacheByPattern('user_notifications');
      
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  // =============================================================================
  // EVENTS AND MONITORING
  // =============================================================================

  async emitEvent(event: UserEvent): Promise<void> {
    try {
      await this.apiClient.post('/api/v1/users/events', event);
    } catch (error) {
      // Don't throw error for event emission failures
      console.warn('Failed to emit event:', error);
    }
  }

  async getEventHistory(): Promise<UserEvent[]> {
    try {
      const response = await this.apiClient.get<UserEvent[]>('/api/v1/users/events');
      return response;
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  clearCache(): void {
    this.cache.clear();
  }

  async refreshAllData(): Promise<void> {
    try {
      // Refresh user data
      if (this.currentUser) {
        await this.refreshUser();
      }
      
      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.warn('Failed to refresh all data:', error);
    }
  }

  isOnline(): boolean {
    return this.isOnlineStatus;
  }

  async getServiceHealth(): Promise<boolean> {
    try {
      await this.apiClient.get('/api/v1/users/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cacheTimeout
    });
  }

  private clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private loadCurrentUser(): void {
    try {
      const userData = localStorage.getItem('trend_analysis_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.warn('Failed to load current user from storage:', error);
    }
  }

  private saveCurrentUser(): void {
    if (this.currentUser) {
      localStorage.setItem('trend_analysis_user', JSON.stringify(this.currentUser));
    }
  }

  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnlineStatus = true;
      this.refreshAllData();
    });

    window.addEventListener('offline', () => {
      this.isOnlineStatus = false;
    });
  }

  private handleUserError(error: any): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }

    if (error.message) {
      return {
        error: 'USER_SERVICE_ERROR',
        message: error.message,
        statusCode: error.status || 500,
        details: error
      };
    }

    return {
      error: 'UNKNOWN_ERROR',
      message: 'An unknown user service error occurred',
      statusCode: 500,
      details: error
    };
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createUserService(apiClient: ApiClient, config?: Partial<UserServiceConfig>): UserService {
  const defaultConfig: UserServiceConfig = {
    apiClient,
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    enableOfflineSupport: true,
    enableActivityTracking: true,
    enableAnalytics: true,
    enableNotifications: true,
    enableBackup: true,
    ...config
  };

  return new UserService(defaultConfig);
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default createUserService;
