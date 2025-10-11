/**
 * Error types for the Trend Analysis Platform.
 * 
 * This module defines all error-related types and interfaces
 * for comprehensive error handling throughout the application.
 */

// =============================================================================
// ERROR SEVERITY LEVELS
// =============================================================================

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// =============================================================================
// ERROR CATEGORIES
// =============================================================================

export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown'
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export enum ErrorType {
  // Network errors
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  CONNECTION_ERROR = 'connection_error',
  DNS_ERROR = 'dns_error',
  
  // Authentication errors
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  TOKEN_EXPIRED = 'token_expired',
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_DISABLED = 'account_disabled',
  
  // Validation errors
  VALIDATION_ERROR = 'validation_error',
  REQUIRED_FIELD = 'required_field',
  INVALID_FORMAT = 'invalid_format',
  INVALID_VALUE = 'invalid_value',
  DUPLICATE_VALUE = 'duplicate_value',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'business_rule_violation',
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  RESOURCE_NOT_FOUND = 'resource_not_found',
  RESOURCE_CONFLICT = 'resource_conflict',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  DATABASE_ERROR = 'database_error',
  CONFIGURATION_ERROR = 'configuration_error',
  
  // User input errors
  INVALID_INPUT = 'invalid_input',
  MISSING_INPUT = 'missing_input',
  INVALID_FILE_TYPE = 'invalid_file_type',
  FILE_TOO_LARGE = 'file_too_large',
  
  // External service errors
  EXTERNAL_API_ERROR = 'external_api_error',
  EXTERNAL_SERVICE_DOWN = 'external_service_down',
  EXTERNAL_RATE_LIMIT = 'external_rate_limit',
  
  // Unknown errors
  UNKNOWN_ERROR = 'unknown_error'
}

// =============================================================================
// ERROR INTERFACES
// =============================================================================

export interface BaseError {
  id: string;
  type: ErrorType;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  timestamp: number;
  source: string;
  context?: Record<string, any>;
  stack?: string;
  userMessage?: string;
  technicalMessage?: string;
  suggestions?: string[];
  retryable: boolean;
  retryAfter?: number;
  errorCode?: string;
  correlationId?: string;
}

export interface NetworkError extends BaseError {
  type: ErrorType.NETWORK_ERROR | ErrorType.TIMEOUT_ERROR | ErrorType.CONNECTION_ERROR | ErrorType.DNS_ERROR;
  category: ErrorCategory.NETWORK;
  url?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
}

export interface AuthenticationError extends BaseError {
  type: ErrorType.UNAUTHORIZED | ErrorType.FORBIDDEN | ErrorType.TOKEN_EXPIRED | ErrorType.INVALID_CREDENTIALS | ErrorType.ACCOUNT_LOCKED | ErrorType.ACCOUNT_DISABLED;
  category: ErrorCategory.AUTHENTICATION;
  userId?: string;
  sessionId?: string;
  tokenType?: string;
  expiresAt?: number;
}

export interface ValidationError extends BaseError {
  type: ErrorType.VALIDATION_ERROR | ErrorType.REQUIRED_FIELD | ErrorType.INVALID_FORMAT | ErrorType.INVALID_VALUE | ErrorType.DUPLICATE_VALUE;
  category: ErrorCategory.VALIDATION;
  field?: string;
  value?: any;
  expectedFormat?: string;
  allowedValues?: any[];
}

export interface BusinessLogicError extends BaseError {
  type: ErrorType.BUSINESS_RULE_VIOLATION | ErrorType.INSUFFICIENT_PERMISSIONS | ErrorType.RESOURCE_NOT_FOUND | ErrorType.RESOURCE_CONFLICT | ErrorType.RATE_LIMIT_EXCEEDED;
  category: ErrorCategory.BUSINESS_LOGIC;
  resourceId?: string;
  resourceType?: string;
  operation?: string;
  businessRule?: string;
}

export interface SystemError extends BaseError {
  type: ErrorType.INTERNAL_SERVER_ERROR | ErrorType.SERVICE_UNAVAILABLE | ErrorType.DATABASE_ERROR | ErrorType.CONFIGURATION_ERROR;
  category: ErrorCategory.SYSTEM;
  component?: string;
  service?: string;
  database?: string;
  configurationKey?: string;
}

export interface UserInputError extends BaseError {
  type: ErrorType.INVALID_INPUT | ErrorType.MISSING_INPUT | ErrorType.INVALID_FILE_TYPE | ErrorType.FILE_TOO_LARGE;
  category: ErrorCategory.USER_INPUT;
  inputField?: string;
  inputType?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface ExternalServiceError extends BaseError {
  type: ErrorType.EXTERNAL_API_ERROR | ErrorType.EXTERNAL_SERVICE_DOWN | ErrorType.EXTERNAL_RATE_LIMIT;
  category: ErrorCategory.EXTERNAL_SERVICE;
  serviceName?: string;
  serviceUrl?: string;
  externalErrorCode?: string;
  externalErrorMessage?: string;
}

export interface UnknownError extends BaseError {
  type: ErrorType.UNKNOWN_ERROR;
  category: ErrorCategory.UNKNOWN;
  originalError?: any;
}

// =============================================================================
// ERROR UNION TYPE
// =============================================================================

export type AppError = 
  | NetworkError 
  | AuthenticationError 
  | ValidationError 
  | BusinessLogicError 
  | SystemError 
  | UserInputError 
  | ExternalServiceError 
  | UnknownError;

// =============================================================================
// ERROR CONTEXT
// =============================================================================

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  referrer?: string;
  screenResolution?: string;
  viewportSize?: string;
  browserInfo?: {
    name: string;
    version: string;
    os: string;
  };
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet';
    model?: string;
    manufacturer?: string;
  };
  networkInfo?: {
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  customData?: Record<string, any>;
}

// =============================================================================
// ERROR REPORTING
// =============================================================================

export interface ErrorReport {
  error: AppError;
  context: ErrorContext;
  userActions: string[];
  reproductionSteps?: string[];
  additionalInfo?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    data: string;
  }>;
}

// =============================================================================
// ERROR HANDLING CONFIGURATION
// =============================================================================

export interface ErrorHandlingConfig {
  enableErrorReporting: boolean;
  enableErrorLogging: boolean;
  enableErrorAnalytics: boolean;
  enableErrorRecovery: boolean;
  enableErrorNotifications: boolean;
  maxErrorHistory: number;
  errorReportingEndpoint?: string;
  errorLoggingEndpoint?: string;
  errorAnalyticsEndpoint?: string;
  retryAttempts: number;
  retryDelay: number;
  retryBackoffMultiplier: number;
  maxRetryDelay: number;
  errorNotificationTimeout: number;
  criticalErrorNotificationTimeout: number;
  enableErrorBoundaries: boolean;
  enableErrorFallbacks: boolean;
  enableErrorRecovery: boolean;
  enableErrorRetry: boolean;
  enableErrorCaching: boolean;
  errorCacheTimeout: number;
}

// =============================================================================
// ERROR RECOVERY
// =============================================================================

export interface ErrorRecovery {
  errorId: string;
  recoveryType: 'retry' | 'fallback' | 'redirect' | 'refresh' | 'reload' | 'manual';
  recoveryAction: string;
  recoveryData?: Record<string, any>;
  success: boolean;
  timestamp: number;
  duration: number;
  error?: AppError;
}

// =============================================================================
// ERROR ANALYTICS
// =============================================================================

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByComponent: Record<string, number>;
  errorsByUser: Record<string, number>;
  errorRate: number;
  averageErrorFrequency: number;
  mostCommonErrors: Array<{
    type: ErrorType;
    count: number;
    percentage: number;
  }>;
  errorTrends: Array<{
    timestamp: number;
    count: number;
    severity: ErrorSeverity;
  }>;
  recoveryRate: number;
  averageRecoveryTime: number;
}

// =============================================================================
// ERROR NOTIFICATION
// =============================================================================

export interface ErrorNotification {
  id: string;
  error: AppError;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  severity: ErrorSeverity;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
  dismissible: boolean;
  persistent: boolean;
  timestamp: number;
  read: boolean;
  dismissed: boolean;
}

// =============================================================================
// ERROR BOUNDARY PROPS
// =============================================================================

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  onRecover?: (error: AppError) => void;
  enableRecovery?: boolean;
  enableReporting?: boolean;
  enableLogging?: boolean;
  enableAnalytics?: boolean;
  enableNotifications?: boolean;
  customErrorHandler?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  customRecoveryHandler?: (error: AppError) => void;
  customReportingHandler?: (error: AppError, context: ErrorContext) => void;
  customLoggingHandler?: (error: AppError, context: ErrorContext) => void;
  customAnalyticsHandler?: (error: AppError, context: ErrorContext) => void;
  customNotificationHandler?: (error: AppError, context: ErrorContext) => void;
}

export interface ErrorBoundaryFallbackProps {
  error: AppError;
  errorInfo: React.ErrorInfo;
  retry: () => void;
  reset: () => void;
  report: () => void;
  dismiss: () => void;
}

// =============================================================================
// ERROR HANDLER INTERFACE
// =============================================================================

export interface ErrorHandler {
  handleError(error: AppError, context: ErrorContext): Promise<void>;
  handleRecovery(error: AppError, context: ErrorContext): Promise<ErrorRecovery>;
  handleReporting(error: AppError, context: ErrorContext): Promise<void>;
  handleLogging(error: AppError, context: ErrorContext): Promise<void>;
  handleAnalytics(error: AppError, context: ErrorContext): Promise<void>;
  handleNotification(error: AppError, context: ErrorContext): Promise<void>;
}

// =============================================================================
// ERROR UTILITIES
// =============================================================================

export interface ErrorUtilities {
  createError(type: ErrorType, message: string, context?: Partial<ErrorContext>): AppError;
  createNetworkError(message: string, url?: string, statusCode?: number): NetworkError;
  createAuthenticationError(type: ErrorType, message: string, userId?: string): AuthenticationError;
  createValidationError(type: ErrorType, message: string, field?: string): ValidationError;
  createBusinessLogicError(type: ErrorType, message: string, resourceId?: string): BusinessLogicError;
  createSystemError(type: ErrorType, message: string, component?: string): SystemError;
  createUserInputError(type: ErrorType, message: string, inputField?: string): UserInputError;
  createExternalServiceError(type: ErrorType, message: string, serviceName?: string): ExternalServiceError;
  createUnknownError(message: string, originalError?: any): UnknownError;
  
  isRetryable(error: AppError): boolean;
  shouldReport(error: AppError): boolean;
  shouldLog(error: AppError): boolean;
  shouldNotify(error: AppError): boolean;
  shouldAnalyze(error: AppError): boolean;
  
  getErrorSeverity(error: AppError): ErrorSeverity;
  getErrorCategory(error: AppError): ErrorCategory;
  getErrorType(error: AppError): ErrorType;
  getErrorMessage(error: AppError): string;
  getUserMessage(error: AppError): string;
  getTechnicalMessage(error: AppError): string;
  getSuggestions(error: AppError): string[];
  
  formatError(error: AppError): string;
  formatErrorForUser(error: AppError): string;
  formatErrorForDeveloper(error: AppError): string;
  formatErrorForReporting(error: AppError): string;
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  ErrorSeverity,
  ErrorCategory,
  ErrorType,
  BaseError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  BusinessLogicError,
  SystemError,
  UserInputError,
  ExternalServiceError,
  UnknownError,
  AppError,
  ErrorContext,
  ErrorReport,
  ErrorHandlingConfig,
  ErrorRecovery,
  ErrorAnalytics,
  ErrorNotification,
  ErrorBoundaryProps,
  ErrorBoundaryFallbackProps,
  ErrorHandler,
  ErrorUtilities
};
