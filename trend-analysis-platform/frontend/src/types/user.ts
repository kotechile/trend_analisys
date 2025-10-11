/**
 * User types for the Trend Analysis Platform frontend.
 * 
 * This file defines all TypeScript interfaces and types related to user management,
 * including user profiles, preferences, settings, activity, and administration.
 */

import { UserRole, UserPermissions } from './auth';

// =============================================================================
// USER PROFILE AND PERSONAL DATA
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  profileImageUrl?: string;
}

export interface UserProfileResponse {
  user: UserProfile;
  message: string;
}

// =============================================================================
// USER PREFERENCES AND SETTINGS
// =============================================================================

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  display: DisplaySettings;
  analytics: AnalyticsSettings;
  content: ContentSettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: {
    marketing: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
    weeklyDigest: boolean;
    trendAlerts: boolean;
  };
  push: {
    enabled: boolean;
    trendAlerts: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
  };
  inApp: {
    enabled: boolean;
    trendAlerts: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showLastActive: boolean;
  showLocation: boolean;
  allowDirectMessages: boolean;
  dataSharing: {
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
  };
}

export interface DisplaySettings {
  itemsPerPage: number;
  defaultView: 'grid' | 'list' | 'table';
  showThumbnails: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
}

export interface AnalyticsSettings {
  trackingEnabled: boolean;
  performanceMetrics: boolean;
  errorReporting: boolean;
  usageAnalytics: boolean;
  personalizedRecommendations: boolean;
}

export interface ContentSettings {
  defaultLanguage: string;
  contentFilter: 'none' | 'moderate' | 'strict';
  autoPlay: boolean;
  showMatureContent: boolean;
  trendingTimeframe: '1h' | '24h' | '7d' | '30d';
}

// =============================================================================
// USER ACTIVITY AND ANALYTICS
// =============================================================================

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGE = 'password_change',
  EMAIL_VERIFICATION = 'email_verification',
  SESSION_CREATE = 'session_create',
  SESSION_REVOKE = 'session_revoke',
  PREFERENCE_UPDATE = 'preference_update',
  CONTENT_VIEW = 'content_view',
  CONTENT_CREATE = 'content_create',
  CONTENT_UPDATE = 'content_update',
  CONTENT_DELETE = 'content_delete',
  SEARCH = 'search',
  EXPORT = 'export',
  IMPORT = 'import',
  ADMIN_ACTION = 'admin_action'
}

export interface UserStats {
  userId: string;
  totalLogins: number;
  lastLoginAt: string;
  totalSessions: number;
  activeSessions: number;
  totalActivity: number;
  profileViews: number;
  contentCreated: number;
  contentViewed: number;
  searchesPerformed: number;
  exportsGenerated: number;
  timeSpent: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface UserAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  metrics: {
    logins: number;
    sessions: number;
    pageViews: number;
    contentInteractions: number;
    searchQueries: number;
    exports: number;
    timeSpent: number;
  };
  trends: {
    logins: TrendData[];
    sessions: TrendData[];
    activity: TrendData[];
    content: TrendData[];
  };
}

export interface TrendData {
  date: string;
  value: number;
  change?: number;
  changePercent?: number;
}

// =============================================================================
// USER SESSIONS AND SECURITY
// =============================================================================

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  lastAccessed: string;
  location?: SessionLocation;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  version: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: string;
  osVersion: string;
}

export interface SessionLocation {
  country: string;
  region: string;
  city: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SessionManagement {
  sessions: UserSession[];
  totalSessions: number;
  activeSessions: number;
  maxSessions: number;
  canCreateNew: boolean;
}

// =============================================================================
// USER ADMINISTRATION
// =============================================================================

export interface AdminUserList {
  users: AdminUser[];
  pagination: PaginationInfo;
  filters: UserFilters;
  totalCount: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profileImageUrl?: string;
  stats: {
    totalLogins: number;
    totalSessions: number;
    lastActivity: string;
  };
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminUserUpdate {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface UserBulkAction {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'changeRole';
  data?: {
    role?: UserRole;
  };
}

// =============================================================================
// USER VALIDATION AND FORMS
// =============================================================================

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
}

export interface UserFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  timeFormat?: string;
}

export interface UserValidation {
  isValid: boolean;
  errors: UserFormErrors;
  warnings: string[];
}

export interface UserFormState {
  data: UserFormData;
  errors: UserFormErrors;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
}

// =============================================================================
// USER API RESPONSES
// =============================================================================

export interface UserListResponse {
  users: UserProfile[];
  pagination: PaginationInfo;
  totalCount: number;
}

export interface UserStatsResponse {
  stats: UserStats;
  analytics: UserAnalytics;
}

export interface UserActivityResponse {
  activities: UserActivity[];
  pagination: PaginationInfo;
  totalCount: number;
}

export interface UserPreferencesResponse {
  preferences: UserPreferences;
  message: string;
}

export interface UserSessionsResponse {
  sessions: UserSession[];
  management: SessionManagement;
}

// =============================================================================
// USER HOOKS AND CONTEXT
// =============================================================================

export interface UseUserReturn {
  // State
  user: UserProfile | null;
  preferences: UserPreferences | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateProfile: (data: UserProfileUpdate) => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

export interface UseUserPreferencesReturn {
  // State
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  clearError: () => void;
}

export interface UseUserActivityReturn {
  // State
  activities: UserActivity[];
  analytics: UserAnalytics | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshActivities: () => Promise<void>;
  refreshAnalytics: (period: string) => Promise<void>;
  clearError: () => void;
}

export interface UseUserSessionsReturn {
  // State
  sessions: UserSession[];
  management: SessionManagement | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  clearError: () => void;
}

// =============================================================================
// USER COMPONENT PROPS
// =============================================================================

export interface UserProfileProps {
  user: UserProfile;
  onUpdate: (data: UserProfileUpdate) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  isEditable?: boolean;
}

export interface UserPreferencesProps {
  preferences: UserPreferences;
  onUpdate: (data: Partial<UserPreferences>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface UserActivityProps {
  activities: UserActivity[];
  analytics: UserAnalytics | null;
  onRefresh: () => Promise<void>;
  onLoadMore: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface UserSessionsProps {
  sessions: UserSession[];
  management: SessionManagement | null;
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllSessions: () => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface AdminUserListProps {
  users: AdminUser[];
  pagination: PaginationInfo;
  filters: UserFilters;
  onUserUpdate: (userId: string, data: AdminUserUpdate) => Promise<void>;
  onUserDelete: (userId: string) => Promise<void>;
  onBulkAction: (action: UserBulkAction) => Promise<void>;
  onFilterChange: (filters: UserFilters) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

// =============================================================================
// USER UTILITIES AND HELPERS
// =============================================================================

export interface UserSearchResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  matchScore: number;
}

export interface UserExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields: (keyof UserProfile)[];
  filters?: UserFilters;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface UserImportOptions {
  format: 'csv' | 'json' | 'xlsx';
  mapping: Record<string, keyof UserProfile>;
  validation: {
    skipInvalid: boolean;
    updateExisting: boolean;
    createMissing: boolean;
  };
}

export interface UserBackup {
  user: UserProfile;
  preferences: UserPreferences;
  activities: UserActivity[];
  sessions: UserSession[];
  createdAt: string;
  version: string;
}

// =============================================================================
// USER EVENTS AND NOTIFICATIONS
// =============================================================================

export interface UserEvent {
  type: 'profile_update' | 'preference_change' | 'session_create' | 'session_revoke' | 'activity_log';
  userId: string;
  timestamp: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Re-export commonly used types for convenience
  UserProfile as User,
  UserProfileUpdate as UserUpdate,
  UserPreferences as UserSettings,
  UserActivity as Activity,
  UserStats as Stats,
  UserAnalytics as Analytics,
  UserSession as Session,
  AdminUser as AdminUserInfo,
  UserFormData as FormData,
  UserFormErrors as FormErrors,
  UserValidation as Validation,
  UserFormState as FormState,
  UserListResponse as ListResponse,
  UserStatsResponse as StatsResponse,
  UserActivityResponse as ActivityResponse,
  UserPreferencesResponse as PreferencesResponse,
  UserSessionsResponse as SessionsResponse,
  UseUserReturn as UseUser,
  UseUserPreferencesReturn as UsePreferences,
  UseUserActivityReturn as UseActivity,
  UseUserSessionsReturn as UseSessions,
  UserProfileProps as ProfileProps,
  UserPreferencesProps as PreferencesProps,
  UserActivityProps as ActivityProps,
  UserSessionsProps as SessionsProps,
  AdminUserListProps as AdminListProps,
  UserSearchResult as SearchResult,
  UserExportOptions as ExportOptions,
  UserImportOptions as ImportOptions,
  UserBackup as Backup,
  UserEvent as Event,
  UserNotification as Notification,
};
