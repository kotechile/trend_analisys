/**
 * useUser Hook for the Trend Analysis Platform frontend.
 * 
 * This hook provides React integration for user management functionality,
 * including profile management, preferences, activity tracking, and more.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { UserService } from '../services/userService';
import { ApiClient } from '../services/apiClient';
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
  UseUserReturn,
  UseUserPreferencesReturn,
  UseUserActivityReturn,
  UseUserSessionsReturn,
  ApiError,
  PaginationInfo,
  UserFilters
} from '../types/user';

// =============================================================================
// USER CONTEXT
// =============================================================================

interface UserContextType {
  // Profile Management
  user: UserProfile | null;
  updateProfile: (data: UserProfileUpdate) => Promise<UserProfileResponse>;
  refreshUser: () => Promise<UserProfile>;
  deleteProfile: () => Promise<void>;
  
  // Preferences Management
  preferences: UserPreferences | null;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<UserPreferencesResponse>;
  resetPreferences: () => Promise<UserPreferencesResponse>;
  
  // Activity Management
  activities: UserActivity[];
  getActivities: (page?: number, limit?: number) => Promise<UserActivityResponse>;
  getActivityAnalytics: (period: string) => Promise<UserAnalytics>;
  trackActivity: (type: string, description: string, metadata?: Record<string, any>) => Promise<void>;
  
  // Statistics and Analytics
  stats: UserStats | null;
  analytics: UserAnalytics | null;
  getUserStats: () => Promise<UserStatsResponse>;
  getAnalytics: (period: string) => Promise<UserAnalytics>;
  
  // Session Management
  sessions: UserSessionsResponse | null;
  getUserSessions: () => Promise<UserSessionsResponse>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  
  // Search and Discovery
  searchUsers: (query: string, filters?: UserFilters) => Promise<UserSearchResult[]>;
  getUserSuggestions: (query: string) => Promise<UserSearchResult[]>;
  
  // Export and Import
  exportUserData: (options: UserExportOptions) => Promise<Blob>;
  importUserData: (file: File, options: UserImportOptions) => Promise<void>;
  
  // Backup and Restore
  createBackup: () => Promise<UserBackup>;
  restoreBackup: (backup: UserBackup) => Promise<void>;
  
  // Notifications
  notifications: UserNotification[];
  getNotifications: () => Promise<UserNotification[]>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Events and Monitoring
  emitEvent: (event: UserEvent) => Promise<void>;
  getEventHistory: () => Promise<UserEvent[]>;
  
  // State Management
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  
  // Utility Methods
  clearError: () => void;
  refreshAllData: () => Promise<void>;
  clearCache: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// =============================================================================
// USER PROVIDER PROPS
// =============================================================================

export interface UserProviderProps {
  children: React.ReactNode;
  userService: UserService;
  apiClient: ApiClient;
  fallback?: React.ReactNode;
  onUserStateChange?: (user: UserProfile | null) => void;
  onError?: (error: ApiError) => void;
  enableActivityTracking?: boolean;
  enableAnalytics?: boolean;
  enableNotifications?: boolean;
  enableBackup?: boolean;
}

// =============================================================================
// USER PROVIDER COMPONENT
// =============================================================================

export function UserProvider({ 
  children, 
  userService, 
  apiClient, 
  fallback,
  onUserStateChange,
  onError,
  enableActivityTracking = true,
  enableAnalytics = true,
  enableNotifications = true,
  enableBackup = true
}: UserProviderProps) {
  const [state, setState] = useState({
    user: null as UserProfile | null,
    preferences: null as UserPreferences | null,
    activities: [] as UserActivity[],
    stats: null as UserStats | null,
    analytics: null as UserAnalytics | null,
    sessions: null as UserSessionsResponse | null,
    notifications: [] as UserNotification[],
    isLoading: false,
    error: null as string | null,
    isOnline: navigator.onLine
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      
      // Notify parent component of user state changes
      if (onUserStateChange) {
        onUserStateChange(newState.user);
      }
      
      return newState;
    });
  }, [onUserStateChange]);

  const setError = useCallback((error: ApiError | null) => {
    updateState({ error: error?.message || null });
    if (error && onError) {
      onError(error);
    }
  }, [updateState, onError]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  const initializeUser = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });

      // Get current user
      const user = userService.getCurrentUser();
      if (user) {
        updateState({ user });
        
        // Load additional data in parallel
        const promises = [];
        
        if (enableAnalytics) {
          promises.push(
            userService.getUserStats().then(stats => updateState({ stats: stats.stats })),
            userService.getActivityAnalytics('week').then(analytics => updateState({ analytics }))
          );
        }
        
        if (enableNotifications) {
          promises.push(
            userService.getNotifications().then(notifications => updateState({ notifications }))
          );
        }
        
        promises.push(
          userService.getUserSessions().then(sessions => updateState({ sessions })),
          userService.getActivities(1, 10).then(response => updateState({ activities: response.activities }))
        );
        
        await Promise.allSettled(promises);
      }
      
      updateState({ isLoading: false });
    } catch (error) {
      console.error('User initialization failed:', error);
      setError(error as ApiError);
      updateState({ isLoading: false });
    } finally {
      setIsInitialized(true);
    }
  }, [userService, updateState, setError, enableAnalytics, enableNotifications]);

  // =============================================================================
  // PROFILE MANAGEMENT
  // =============================================================================

  const updateProfile = useCallback(async (data: UserProfileUpdate): Promise<UserProfileResponse> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await userService.updateProfile(data);
      
      updateState({
        user: response.user,
        isLoading: false,
        error: null
      });
      
      return response;
    } catch (error) {
      setError(error as ApiError);
      updateState({ isLoading: false });
      throw error;
    }
  }, [userService, updateState, setError]);

  const refreshUser = useCallback(async (): Promise<UserProfile> => {
    try {
      const user = await userService.refreshUser();
      updateState({ user });
      return user;
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, updateState, setError]);

  const deleteProfile = useCallback(async (): Promise<void> => {
    try {
      updateState({ isLoading: true, error: null });
      
      await userService.deleteProfile();
      
      updateState({
        user: null,
        preferences: null,
        activities: [],
        stats: null,
        analytics: null,
        sessions: null,
        notifications: [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      setError(error as ApiError);
      updateState({ isLoading: false });
      throw error;
    }
  }, [userService, updateState, setError]);

  // =============================================================================
  // PREFERENCES MANAGEMENT
  // =============================================================================

  const updatePreferences = useCallback(async (data: Partial<UserPreferences>): Promise<UserPreferencesResponse> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await userService.updatePreferences(data);
      
      updateState({
        preferences: response.preferences,
        isLoading: false,
        error: null
      });
      
      return response;
    } catch (error) {
      setError(error as ApiError);
      updateState({ isLoading: false });
      throw error;
    }
  }, [userService, updateState, setError]);

  const resetPreferences = useCallback(async (): Promise<UserPreferencesResponse> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await userService.resetPreferences();
      
      updateState({
        preferences: response.preferences,
        isLoading: false,
        error: null
      });
      
      return response;
    } catch (error) {
      setError(error as ApiError);
      updateState({ isLoading: false });
      throw error;
    }
  }, [userService, updateState, setError]);

  // =============================================================================
  // ACTIVITY MANAGEMENT
  // =============================================================================

  const getActivities = useCallback(async (page: number = 1, limit: number = 20): Promise<UserActivityResponse> => {
    try {
      const response = await userService.getActivities(page, limit);
      updateState({ activities: response.activities });
      return response;
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, updateState, setError]);

  const getActivityAnalytics = useCallback(async (period: string): Promise<UserAnalytics> => {
    try {
      const analytics = await userService.getActivityAnalytics(period);
      updateState({ analytics });
      return analytics;
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, updateState, setError]);

  const trackActivity = useCallback(async (type: string, description: string, metadata?: Record<string, any>): Promise<void> => {
    if (!enableActivityTracking) return;
    
    try {
      await userService.trackActivity(type, description, metadata);
    } catch (error) {
      console.warn('Failed to track activity:', error);
    }
  }, [userService, enableActivityTracking]);

  // =============================================================================
  // STATISTICS AND ANALYTICS
  // =============================================================================

  const getUserStats = useCallback(async (): Promise<UserStatsResponse> => {
    try {
      const response = await userService.getUserStats();
      updateState({ stats: response.stats });
      return response;
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, updateState, setError]);

  const getAnalytics = useCallback(async (period: string): Promise<UserAnalytics> => {
    return getActivityAnalytics(period);
  }, [getActivityAnalytics]);

  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  const getUserSessions = useCallback(async (): Promise<UserSessionsResponse> => {
    try {
      const sessions = await userService.getUserSessions();
      updateState({ sessions });
      return sessions;
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, updateState, setError]);

  const revokeSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await userService.revokeSession(sessionId);
      // Refresh sessions
      await getUserSessions();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, getUserSessions, setError]);

  const revokeAllSessions = useCallback(async (): Promise<void> => {
    try {
      await userService.revokeAllSessions();
      // Refresh sessions
      await getUserSessions();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, getUserSessions, setError]);

  // =============================================================================
  // SEARCH AND DISCOVERY
  // =============================================================================

  const searchUsers = useCallback(async (query: string, filters?: UserFilters): Promise<UserSearchResult[]> => {
    try {
      return await userService.searchUsers(query, filters);
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, setError]);

  const getUserSuggestions = useCallback(async (query: string): Promise<UserSearchResult[]> => {
    try {
      return await userService.getUserSuggestions(query);
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, setError]);

  // =============================================================================
  // EXPORT AND IMPORT
  // =============================================================================

  const exportUserData = useCallback(async (options: UserExportOptions): Promise<Blob> => {
    try {
      return await userService.exportUserData(options);
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, setError]);

  const importUserData = useCallback(async (file: File, options: UserImportOptions): Promise<void> => {
    try {
      await userService.importUserData(file, options);
      // Refresh all data after import
      await refreshAllData();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, setError]);

  // =============================================================================
  // BACKUP AND RESTORE
  // =============================================================================

  const createBackup = useCallback(async (): Promise<UserBackup> => {
    try {
      return await userService.createBackup();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, setError]);

  const restoreBackup = useCallback(async (backup: UserBackup): Promise<void> => {
    try {
      await userService.restoreBackup(backup);
      // Refresh all data after restore
      await refreshAllData();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, setError]);

  // =============================================================================
  // NOTIFICATIONS
  // =============================================================================

  const getNotifications = useCallback(async (): Promise<UserNotification[]> => {
    try {
      const notifications = await userService.getNotifications();
      updateState({ notifications });
      return notifications;
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, updateState, setError]);

  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await userService.markNotificationAsRead(notificationId);
      // Refresh notifications
      await getNotifications();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, getNotifications, setError]);

  const markAllNotificationsAsRead = useCallback(async (): Promise<void> => {
    try {
      await userService.markAllNotificationsAsRead();
      // Refresh notifications
      await getNotifications();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, getNotifications, setError]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await userService.deleteNotification(notificationId);
      // Refresh notifications
      await getNotifications();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, getNotifications, setError]);

  // =============================================================================
  // EVENTS AND MONITORING
  // =============================================================================

  const emitEvent = useCallback(async (event: UserEvent): Promise<void> => {
    try {
      await userService.emitEvent(event);
    } catch (error) {
      console.warn('Failed to emit event:', error);
    }
  }, [userService]);

  const getEventHistory = useCallback(async (): Promise<UserEvent[]> => {
    try {
      return await userService.getEventHistory();
    } catch (error) {
      setError(error as ApiError);
      throw error;
    }
  }, [userService, setError]);

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  const refreshAllData = useCallback(async (): Promise<void> => {
    try {
      await userService.refreshAllData();
      // Re-initialize user data
      await initializeUser();
    } catch (error) {
      console.warn('Failed to refresh all data:', error);
    }
  }, [userService, initializeUser]);

  const clearCache = useCallback(() => {
    userService.clearCache();
  }, [userService]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize user on mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Setup online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      updateState({ isOnline: true });
      refreshAllData();
    };

    const handleOffline = () => {
      updateState({ isOnline: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateState, refreshAllData]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: UserContextType = {
    // Profile Management
    user: state.user,
    updateProfile,
    refreshUser,
    deleteProfile,
    
    // Preferences Management
    preferences: state.preferences,
    updatePreferences,
    resetPreferences,
    
    // Activity Management
    activities: state.activities,
    getActivities,
    getActivityAnalytics,
    trackActivity,
    
    // Statistics and Analytics
    stats: state.stats,
    analytics: state.analytics,
    getUserStats,
    getAnalytics,
    
    // Session Management
    sessions: state.sessions,
    getUserSessions,
    revokeSession,
    revokeAllSessions,
    
    // Search and Discovery
    searchUsers,
    getUserSuggestions,
    
    // Export and Import
    exportUserData,
    importUserData,
    
    // Backup and Restore
    createBackup,
    restoreBackup,
    
    // Notifications
    notifications: state.notifications,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    
    // Events and Monitoring
    emitEvent,
    getEventHistory,
    
    // State Management
    isLoading: state.isLoading,
    error: state.error,
    isOnline: state.isOnline,
    
    // Utility Methods
    clearError,
    refreshAllData,
    clearCache
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!isInitialized) {
    return fallback || <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// =============================================================================
// USE USER HOOK
// =============================================================================

export function useUser(): UseUserReturn {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return {
    user: context.user,
    isLoading: context.isLoading,
    error: context.error,
    updateProfile: context.updateProfile,
    refreshUser: context.refreshUser,
    clearError: context.clearError
  };
}

// =============================================================================
// SPECIALIZED HOOKS
// =============================================================================

export function useUserPreferences(): UseUserPreferencesReturn {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserProvider');
  }

  return {
    preferences: context.preferences,
    isLoading: context.isLoading,
    error: context.error,
    updatePreferences: context.updatePreferences,
    resetPreferences: context.resetPreferences,
    refreshPreferences: async () => {
      // This would typically refresh preferences from server
      console.log('Refreshing preferences...');
    },
    clearError: context.clearError
  };
}

export function useUserActivity(): UseUserActivityReturn {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserActivity must be used within a UserProvider');
  }

  return {
    activities: context.activities,
    analytics: context.analytics,
    isLoading: context.isLoading,
    error: context.error,
    refreshActivities: context.getActivities,
    refreshAnalytics: context.getActivityAnalytics,
    clearError: context.clearError
  };
}

export function useUserSessions(): UseUserSessionsReturn {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserSessions must be used within a UserProvider');
  }

  return {
    sessions: context.sessions?.sessions || [],
    management: context.sessions?.management || null,
    isLoading: context.isLoading,
    error: context.error,
    refreshSessions: context.getUserSessions,
    revokeSession: context.revokeSession,
    revokeAllSessions: context.revokeAllSessions,
    clearError: context.clearError
  };
}

export function useUserNotifications() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserNotifications must be used within a UserProvider');
  }

  return {
    notifications: context.notifications,
    isLoading: context.isLoading,
    error: context.error,
    getNotifications: context.getNotifications,
    markAsRead: context.markNotificationAsRead,
    markAllAsRead: context.markAllNotificationsAsRead,
    deleteNotification: context.deleteNotification,
    clearError: context.clearError
  };
}

export function useUserStats() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserProvider');
  }

  return {
    stats: context.stats,
    analytics: context.analytics,
    isLoading: context.isLoading,
    error: context.error,
    getStats: context.getUserStats,
    getAnalytics: context.getAnalytics,
    clearError: context.clearError
  };
}

export function useUserSearch() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserSearch must be used within a UserProvider');
  }

  return {
    searchUsers: context.searchUsers,
    getUserSuggestions: context.getUserSuggestions,
    isLoading: context.isLoading,
    error: context.error,
    clearError: context.clearError
  };
}

export function useUserExport() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserExport must be used within a UserProvider');
  }

  return {
    exportUserData: context.exportUserData,
    importUserData: context.importUserData,
    createBackup: context.createBackup,
    restoreBackup: context.restoreBackup,
    isLoading: context.isLoading,
    error: context.error,
    clearError: context.clearError
  };
}

// =============================================================================
// HIGHER-ORDER COMPONENTS
// =============================================================================

export function withUser<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType
) {
  return function UserComponent(props: P) {
    const { user, isLoading } = useUser();
    
    if (isLoading) {
      return fallback ? <fallback /> : <div>Loading...</div>;
    }
    
    if (!user) {
      return <div>User not found.</div>;
    }
    
    return <Component {...props} />;
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default useUser;
