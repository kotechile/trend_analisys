/**
 * Authentication types for the Trend Analysis Platform frontend.
 * 
 * This file defines all TypeScript interfaces and types related to authentication,
 * including user data, API responses, form data, and authentication state.
 */

// =============================================================================
// USER ROLES AND PERMISSIONS
// =============================================================================

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface UserPermissions {
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageContent: boolean;
  canAccessAdminPanel: boolean;
}

// =============================================================================
// USER DATA TYPES
// =============================================================================

export interface User {
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
}

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
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
  };
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  lastAccessed: string;
}

// =============================================================================
// AUTHENTICATION TOKENS
// =============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface TokenData {
  userId: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  iat: number;
  exp: number;
  jti: string;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

// Login
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

// Registration
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface RegisterResponse {
  user: User;
  message: string;
  verificationEmailSent: boolean;
}

// Password Reset
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetResponse {
  message: string;
}

// Email Verification
export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
}

// Profile Update
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export interface ProfileUpdateResponse {
  user: User;
  message: string;
}

// Session Management
export interface UserSessionsResponse {
  sessions: UserSession[];
}

export interface RevokeSessionRequest {
  sessionId: string;
}

export interface RevokeSessionResponse {
  message: string;
}

export interface RevokeAllSessionsResponse {
  message: string;
}

// =============================================================================
// AUTHENTICATION STATE
// =============================================================================

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: UserPermissions | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (profileData: ProfileUpdateRequest) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirmRequest) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  getUserSessions: () => Promise<UserSession[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  clearError: () => void;
}

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// =============================================================================
// API ERROR TYPES
// =============================================================================

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  message?: string;
  success: boolean;
}

// =============================================================================
// AUTHENTICATION CONFIGURATION
// =============================================================================

export interface AuthConfig {
  apiBaseUrl: string;
  tokenStorageKey: string;
  refreshTokenStorageKey: string;
  userStorageKey: string;
  tokenRefreshThreshold: number; // minutes before expiry to refresh
  maxRetryAttempts: number;
  retryDelay: number; // milliseconds
}

// =============================================================================
// AUTHENTICATION EVENTS
// =============================================================================

export interface AuthEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'profile_update' | 'session_revoke';
  timestamp: string;
  userId?: string;
  data?: any;
}

export interface AuthEventListener {
  (event: AuthEvent): void;
}

// =============================================================================
// SECURITY TYPES
// =============================================================================

export interface SecuritySettings {
  enableTwoFactor: boolean;
  enableBiometric: boolean;
  sessionTimeout: number; // minutes
  maxConcurrentSessions: number;
  requireEmailVerification: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  version: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_REFRESH'; payload: { tokens: AuthTokens } }
  | { type: 'AUTH_UPDATE_PROFILE'; payload: { user: User } }
  | { type: 'AUTH_CLEAR_ERROR' };

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type LoginMethod = 'email' | 'google' | 'github' | 'microsoft';

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: UserPermissions | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (profileData: ProfileUpdateRequest) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirmRequest) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
}

export interface UseUserReturn {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateProfile: (profileData: ProfileUpdateRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export interface UseSessionsReturn {
  // State
  sessions: UserSession[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  clearError: () => void;
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface AuthFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onError?: (error: string) => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: (keyof UserPermissions)[];
  fallback?: React.ReactNode;
}

export interface UserProfileProps {
  user: User;
  onUpdate: (data: ProfileUpdateRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface SessionManagementProps {
  sessions: UserSession[];
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllSessions: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Re-export commonly used types for convenience
  User as AuthUser,
  UserProfile as AuthUserProfile,
  AuthTokens as AuthTokenPair,
  LoginRequest as AuthLoginRequest,
  RegisterRequest as AuthRegisterRequest,
  AuthState as AuthContextState,
  AuthContextType as AuthContextInterface,
  ApiError as AuthApiError,
  ApiResponse as AuthApiResponse,
  FormErrors as AuthFormErrors,
  ValidationResult as AuthValidationResult,
};

