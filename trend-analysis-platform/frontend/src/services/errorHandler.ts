/**
 * Error Handler Service for the Trend Analysis Platform.
 * 
 * This service provides comprehensive error handling, reporting,
 * logging, analytics, and recovery mechanisms.
 */

import { 
  AppError, 
  ErrorType, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorContext, 
  ErrorReport, 
  ErrorRecovery, 
  ErrorAnalytics, 
  ErrorNotification, 
  ErrorHandlingConfig, 
  ErrorHandler as IErrorHandler,
  ErrorUtilities 
} from '../types/errors';
import { apiConfig } from './apiConfig';

// =============================================================================
// ERROR HANDLER SERVICE
// =============================================================================

export class ErrorHandlerService implements IErrorHandler, ErrorUtilities {
  private config: ErrorHandlingConfig;
  private errorHistory: AppError[];
  private recoveryHistory: ErrorRecovery[];
  private analytics: ErrorAnalytics;
  private notifications: ErrorNotification[];
  private isInitialized: boolean;

  constructor(config?: Partial<ErrorHandlingConfig>) {
    this.config = {
      enableErrorReporting: true,
      enableErrorLogging: true,
      enableErrorAnalytics: true,
      enableErrorRecovery: true,
      enableErrorNotifications: true,
      maxErrorHistory: 1000,
      errorReportingEndpoint: '/api/v1/errors/report',
      errorLoggingEndpoint: '/api/v1/errors/log',
      errorAnalyticsEndpoint: '/api/v1/errors/analytics',
      retryAttempts: 3,
      retryDelay: 1000,
      retryBackoffMultiplier: 2,
      maxRetryDelay: 30000,
      errorNotificationTimeout: 5000,
      criticalErrorNotificationTimeout: 10000,
      enableErrorBoundaries: true,
      enableErrorFallbacks: true,
      enableErrorRecovery: true,
      enableErrorRetry: true,
      enableErrorCaching: true,
      errorCacheTimeout: 300000,
      ...config
    };
    
    this.errorHistory = [];
    this.recoveryHistory = [];
    this.analytics = this.initializeAnalytics();
    this.notifications = [];
    this.isInitialized = false;
    
    this.initialize();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  private initialize(): void {
    if (this.isInitialized) return;
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    // Set up unhandled promise rejection handler
    this.setupUnhandledRejectionHandler();
    
    // Set up error reporting
    if (this.config.enableErrorReporting) {
      this.setupErrorReporting();
    }
    
    // Set up error logging
    if (this.config.enableErrorLogging) {
      this.setupErrorLogging();
    }
    
    // Set up error analytics
    if (this.config.enableErrorAnalytics) {
      this.setupErrorAnalytics();
    }
    
    // Set up error notifications
    if (this.config.enableErrorNotifications) {
      this.setupErrorNotifications();
    }
    
    this.isInitialized = true;
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      const error = this.createErrorFromEvent(event);
      this.handleError(error, this.getCurrentContext());
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const error = this.createErrorFromPromiseRejection(event);
      this.handleError(error, this.getCurrentContext());
    });
  }

  private setupUnhandledRejectionHandler(): void {
    window.addEventListener('unhandledrejection', (event) => {
      const error = this.createErrorFromPromiseRejection(event);
      this.handleError(error, this.getCurrentContext());
    });
  }

  private setupErrorReporting(): void {
    // Error reporting is handled in the handleError method
  }

  private setupErrorLogging(): void {
    // Error logging is handled in the handleError method
  }

  private setupErrorAnalytics(): void {
    // Error analytics is handled in the handleError method
  }

  private setupErrorNotifications(): void {
    // Error notifications are handled in the handleError method
  }

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================

  async handleError(error: AppError, context: ErrorContext): Promise<void> {
    try {
      // Add to error history
      this.addToErrorHistory(error);
      
      // Update analytics
      this.updateAnalytics(error);
      
      // Handle reporting
      if (this.shouldReport(error)) {
        await this.handleReporting(error, context);
      }
      
      // Handle logging
      if (this.shouldLog(error)) {
        await this.handleLogging(error, context);
      }
      
      // Handle analytics
      if (this.shouldAnalyze(error)) {
        await this.handleAnalytics(error, context);
      }
      
      // Handle notification
      if (this.shouldNotify(error)) {
        await this.handleNotification(error, context);
      }
      
      // Handle recovery
      if (this.config.enableErrorRecovery && this.isRetryable(error)) {
        await this.handleRecovery(error, context);
      }
      
    } catch (handlingError) {
      console.error('Error in error handler:', handlingError);
    }
  }

  async handleRecovery(error: AppError, context: ErrorContext): Promise<ErrorRecovery> {
    const startTime = Date.now();
    
    try {
      let recovery: ErrorRecovery;
      
      // Determine recovery strategy based on error type
      switch (error.type) {
        case ErrorType.NETWORK_ERROR:
        case ErrorType.TIMEOUT_ERROR:
        case ErrorType.CONNECTION_ERROR:
          recovery = await this.handleNetworkErrorRecovery(error, context);
          break;
          
        case ErrorType.UNAUTHORIZED:
        case ErrorType.TOKEN_EXPIRED:
          recovery = await this.handleAuthenticationErrorRecovery(error, context);
          break;
          
        case ErrorType.RATE_LIMIT_EXCEEDED:
          recovery = await this.handleRateLimitErrorRecovery(error, context);
          break;
          
        case ErrorType.SERVICE_UNAVAILABLE:
          recovery = await this.handleServiceUnavailableErrorRecovery(error, context);
          break;
          
        default:
          recovery = await this.handleGenericErrorRecovery(error, context);
      }
      
      // Record recovery
      this.recoveryHistory.push(recovery);
      
      return recovery;
      
    } catch (recoveryError) {
      const recovery: ErrorRecovery = {
        errorId: error.id,
        recoveryType: 'manual',
        recoveryAction: 'failed',
        success: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: this.createUnknownError('Recovery failed', recoveryError)
      };
      
      this.recoveryHistory.push(recovery);
      return recovery;
    }
  }

  async handleReporting(error: AppError, context: ErrorContext): Promise<void> {
    if (!this.config.enableErrorReporting || !this.config.errorReportingEndpoint) {
      return;
    }
    
    try {
      const report: ErrorReport = {
        error,
        context,
        userActions: this.getUserActions(),
        additionalInfo: this.getAdditionalInfo(),
        attachments: this.getAttachments()
      };
      
      // Send error report to backend
      const response = await fetch(this.config.errorReportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify(report)
      });
      
      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.status}`);
      }
      
    } catch (reportingError) {
      console.error('Error reporting failed:', reportingError);
    }
  }

  async handleLogging(error: AppError, context: ErrorContext): Promise<void> {
    if (!this.config.enableErrorLogging) {
      return;
    }
    
    try {
      const logEntry = {
        error,
        context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        stack: error.stack
      };
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', logEntry);
      }
      
      // Send to logging endpoint
      if (this.config.errorLoggingEndpoint) {
        await fetch(this.config.errorLoggingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`
          },
          body: JSON.stringify(logEntry)
        });
      }
      
    } catch (loggingError) {
      console.error('Error logging failed:', loggingError);
    }
  }

  async handleAnalytics(error: AppError, context: ErrorContext): Promise<void> {
    if (!this.config.enableErrorAnalytics) {
      return;
    }
    
    try {
      const analyticsData = {
        error,
        context,
        timestamp: Date.now(),
        sessionId: context.sessionId,
        userId: context.userId
      };
      
      // Send to analytics endpoint
      if (this.config.errorAnalyticsEndpoint) {
        await fetch(this.config.errorAnalyticsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`
          },
          body: JSON.stringify(analyticsData)
        });
      }
      
    } catch (analyticsError) {
      console.error('Error analytics failed:', analyticsError);
    }
  }

  async handleNotification(error: AppError, context: ErrorContext): Promise<void> {
    if (!this.config.enableErrorNotifications) {
      return;
    }
    
    try {
      const notification: ErrorNotification = {
        id: this.generateId(),
        error,
        title: this.getErrorTitle(error),
        message: this.getErrorMessage(error),
        type: this.getErrorNotificationType(error),
        severity: error.severity,
        duration: this.getErrorNotificationDuration(error),
        actions: this.getErrorNotificationActions(error),
        dismissible: true,
        persistent: error.severity === ErrorSeverity.CRITICAL,
        timestamp: Date.now(),
        read: false,
        dismissed: false
      };
      
      this.notifications.push(notification);
      
      // Show notification to user
      this.showNotification(notification);
      
    } catch (notificationError) {
      console.error('Error notification failed:', notificationError);
    }
  }

  // =============================================================================
  // ERROR CREATION
  // =============================================================================

  createError(type: ErrorType, message: string, context?: Partial<ErrorContext>): AppError {
    const baseError: AppError = {
      id: this.generateId(),
      type,
      category: this.getCategoryFromType(type),
      severity: this.getSeverityFromType(type),
      message,
      timestamp: Date.now(),
      source: context?.component || 'unknown',
      context: context?.customData,
      retryable: this.isRetryableByType(type),
      errorCode: this.getErrorCodeFromType(type)
    };
    
    return baseError;
  }

  createNetworkError(message: string, url?: string, statusCode?: number): AppError {
    return {
      ...this.createError(ErrorType.NETWORK_ERROR, message),
      type: ErrorType.NETWORK_ERROR,
      category: ErrorCategory.NETWORK,
      url,
      statusCode
    } as AppError;
  }

  createAuthenticationError(type: ErrorType, message: string, userId?: string): AppError {
    return {
      ...this.createError(type, message),
      type,
      category: ErrorCategory.AUTHENTICATION,
      userId
    } as AppError;
  }

  createValidationError(type: ErrorType, message: string, field?: string): AppError {
    return {
      ...this.createError(type, message),
      type,
      category: ErrorCategory.VALIDATION,
      field
    } as AppError;
  }

  createBusinessLogicError(type: ErrorType, message: string, resourceId?: string): AppError {
    return {
      ...this.createError(type, message),
      type,
      category: ErrorCategory.BUSINESS_LOGIC,
      resourceId
    } as AppError;
  }

  createSystemError(type: ErrorType, message: string, component?: string): AppError {
    return {
      ...this.createError(type, message),
      type,
      category: ErrorCategory.SYSTEM,
      component
    } as AppError;
  }

  createUserInputError(type: ErrorType, message: string, inputField?: string): AppError {
    return {
      ...this.createError(type, message),
      type,
      category: ErrorCategory.USER_INPUT,
      inputField
    } as AppError;
  }

  createExternalServiceError(type: ErrorType, message: string, serviceName?: string): AppError {
    return {
      ...this.createError(type, message),
      type,
      category: ErrorCategory.EXTERNAL_SERVICE,
      serviceName
    } as AppError;
  }

  createUnknownError(message: string, originalError?: any): AppError {
    return {
      ...this.createError(ErrorType.UNKNOWN_ERROR, message),
      type: ErrorType.UNKNOWN_ERROR,
      category: ErrorCategory.UNKNOWN,
      originalError
    } as AppError;
  }

  // =============================================================================
  // ERROR UTILITIES
  // =============================================================================

  isRetryable(error: AppError): boolean {
    return error.retryable && this.isRetryableByType(error.type);
  }

  shouldReport(error: AppError): boolean {
    return this.config.enableErrorReporting && 
           (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL);
  }

  shouldLog(error: AppError): boolean {
    return this.config.enableErrorLogging;
  }

  shouldNotify(error: AppError): boolean {
    return this.config.enableErrorNotifications && 
           (error.severity === ErrorSeverity.MEDIUM || error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL);
  }

  shouldAnalyze(error: AppError): boolean {
    return this.config.enableErrorAnalytics;
  }

  getErrorSeverity(error: AppError): ErrorSeverity {
    return error.severity;
  }

  getErrorCategory(error: AppError): ErrorCategory {
    return error.category;
  }

  getErrorType(error: AppError): ErrorType {
    return error.type;
  }

  getErrorMessage(error: AppError): string {
    return error.message;
  }

  getUserMessage(error: AppError): string {
    return error.userMessage || error.message;
  }

  getTechnicalMessage(error: AppError): string {
    return error.technicalMessage || error.message;
  }

  getSuggestions(error: AppError): string[] {
    return error.suggestions || [];
  }

  formatError(error: AppError): string {
    return `${error.type}: ${error.message}`;
  }

  formatErrorForUser(error: AppError): string {
    return error.userMessage || error.message;
  }

  formatErrorForDeveloper(error: AppError): string {
    return `${error.type}: ${error.message}\nStack: ${error.stack}`;
  }

  formatErrorForReporting(error: AppError): string {
    return JSON.stringify(error, null, 2);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private createErrorFromEvent(event: ErrorEvent): AppError {
    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      event.message,
      {
        component: 'global',
        timestamp: Date.now(),
        url: event.filename,
        line: event.lineno,
        column: event.colno
      }
    );
  }

  private createErrorFromPromiseRejection(event: PromiseRejectionEvent): AppError {
    const error = event.reason;
    const message = error instanceof Error ? error.message : String(error);
    
    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      message,
      {
        component: 'promise',
        timestamp: Date.now(),
        originalError: error
      }
    );
  }

  private getCurrentContext(): ErrorContext {
    return {
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      requestId: this.generateId(),
      component: 'unknown',
      action: 'unknown',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      browserInfo: this.getBrowserInfo(),
      deviceInfo: this.getDeviceInfo(),
      networkInfo: this.getNetworkInfo()
    };
  }

  private getCurrentUserId(): string | undefined {
    // This would get the current user ID from the auth service
    return undefined;
  }

  private getCurrentSessionId(): string | undefined {
    // This would get the current session ID from the auth service
    return undefined;
  }

  private getAccessToken(): string | undefined {
    // This would get the access token from the auth service
    return undefined;
  }

  private getBrowserInfo(): { name: string; version: string; os: string } {
    const userAgent = navigator.userAgent;
    const browser = this.parseBrowser(userAgent);
    const os = this.parseOS(userAgent);
    
    return {
      name: browser.name,
      version: browser.version,
      os: os.name
    };
  }

  private getDeviceInfo(): { type: 'desktop' | 'mobile' | 'tablet'; model?: string; manufacturer?: string } {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);
    
    return {
      type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'
    };
  }

  private getNetworkInfo(): { connectionType?: string; effectiveType?: string; downlink?: number; rtt?: number } {
    const connection = (navigator as any).connection;
    if (!connection) return {};
    
    return {
      connectionType: connection.type,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    };
  }

  private parseBrowser(userAgent: string): { name: string; version: string } {
    // Simple browser detection
    if (userAgent.includes('Chrome')) {
      return { name: 'Chrome', version: 'Unknown' };
    } else if (userAgent.includes('Firefox')) {
      return { name: 'Firefox', version: 'Unknown' };
    } else if (userAgent.includes('Safari')) {
      return { name: 'Safari', version: 'Unknown' };
    } else if (userAgent.includes('Edge')) {
      return { name: 'Edge', version: 'Unknown' };
    }
    
    return { name: 'Unknown', version: 'Unknown' };
  }

  private parseOS(userAgent: string): { name: string } {
    // Simple OS detection
    if (userAgent.includes('Windows')) {
      return { name: 'Windows' };
    } else if (userAgent.includes('Mac')) {
      return { name: 'macOS' };
    } else if (userAgent.includes('Linux')) {
      return { name: 'Linux' };
    } else if (userAgent.includes('Android')) {
      return { name: 'Android' };
    } else if (userAgent.includes('iOS')) {
      return { name: 'iOS' };
    }
    
    return { name: 'Unknown' };
  }

  private getCategoryFromType(type: ErrorType): ErrorCategory {
    const categoryMap: Record<ErrorType, ErrorCategory> = {
      [ErrorType.NETWORK_ERROR]: ErrorCategory.NETWORK,
      [ErrorType.TIMEOUT_ERROR]: ErrorCategory.NETWORK,
      [ErrorType.CONNECTION_ERROR]: ErrorCategory.NETWORK,
      [ErrorType.DNS_ERROR]: ErrorCategory.NETWORK,
      [ErrorType.UNAUTHORIZED]: ErrorCategory.AUTHENTICATION,
      [ErrorType.FORBIDDEN]: ErrorCategory.AUTHENTICATION,
      [ErrorType.TOKEN_EXPIRED]: ErrorCategory.AUTHENTICATION,
      [ErrorType.INVALID_CREDENTIALS]: ErrorCategory.AUTHENTICATION,
      [ErrorType.ACCOUNT_LOCKED]: ErrorCategory.AUTHENTICATION,
      [ErrorType.ACCOUNT_DISABLED]: ErrorCategory.AUTHENTICATION,
      [ErrorType.VALIDATION_ERROR]: ErrorCategory.VALIDATION,
      [ErrorType.REQUIRED_FIELD]: ErrorCategory.VALIDATION,
      [ErrorType.INVALID_FORMAT]: ErrorCategory.VALIDATION,
      [ErrorType.INVALID_VALUE]: ErrorCategory.VALIDATION,
      [ErrorType.DUPLICATE_VALUE]: ErrorCategory.VALIDATION,
      [ErrorType.BUSINESS_RULE_VIOLATION]: ErrorCategory.BUSINESS_LOGIC,
      [ErrorType.INSUFFICIENT_PERMISSIONS]: ErrorCategory.BUSINESS_LOGIC,
      [ErrorType.RESOURCE_NOT_FOUND]: ErrorCategory.BUSINESS_LOGIC,
      [ErrorType.RESOURCE_CONFLICT]: ErrorCategory.BUSINESS_LOGIC,
      [ErrorType.RATE_LIMIT_EXCEEDED]: ErrorCategory.BUSINESS_LOGIC,
      [ErrorType.INTERNAL_SERVER_ERROR]: ErrorCategory.SYSTEM,
      [ErrorType.SERVICE_UNAVAILABLE]: ErrorCategory.SYSTEM,
      [ErrorType.DATABASE_ERROR]: ErrorCategory.SYSTEM,
      [ErrorType.CONFIGURATION_ERROR]: ErrorCategory.SYSTEM,
      [ErrorType.INVALID_INPUT]: ErrorCategory.USER_INPUT,
      [ErrorType.MISSING_INPUT]: ErrorCategory.USER_INPUT,
      [ErrorType.INVALID_FILE_TYPE]: ErrorCategory.USER_INPUT,
      [ErrorType.FILE_TOO_LARGE]: ErrorCategory.USER_INPUT,
      [ErrorType.EXTERNAL_API_ERROR]: ErrorCategory.EXTERNAL_SERVICE,
      [ErrorType.EXTERNAL_SERVICE_DOWN]: ErrorCategory.EXTERNAL_SERVICE,
      [ErrorType.EXTERNAL_RATE_LIMIT]: ErrorCategory.EXTERNAL_SERVICE,
      [ErrorType.UNKNOWN_ERROR]: ErrorCategory.UNKNOWN
    };
    
    return categoryMap[type] || ErrorCategory.UNKNOWN;
  }

  private getSeverityFromType(type: ErrorType): ErrorSeverity {
    const severityMap: Record<ErrorType, ErrorSeverity> = {
      [ErrorType.NETWORK_ERROR]: ErrorSeverity.MEDIUM,
      [ErrorType.TIMEOUT_ERROR]: ErrorSeverity.MEDIUM,
      [ErrorType.CONNECTION_ERROR]: ErrorSeverity.MEDIUM,
      [ErrorType.DNS_ERROR]: ErrorSeverity.MEDIUM,
      [ErrorType.UNAUTHORIZED]: ErrorSeverity.HIGH,
      [ErrorType.FORBIDDEN]: ErrorSeverity.HIGH,
      [ErrorType.TOKEN_EXPIRED]: ErrorSeverity.MEDIUM,
      [ErrorType.INVALID_CREDENTIALS]: ErrorSeverity.MEDIUM,
      [ErrorType.ACCOUNT_LOCKED]: ErrorSeverity.HIGH,
      [ErrorType.ACCOUNT_DISABLED]: ErrorSeverity.HIGH,
      [ErrorType.VALIDATION_ERROR]: ErrorSeverity.LOW,
      [ErrorType.REQUIRED_FIELD]: ErrorSeverity.LOW,
      [ErrorType.INVALID_FORMAT]: ErrorSeverity.LOW,
      [ErrorType.INVALID_VALUE]: ErrorSeverity.LOW,
      [ErrorType.DUPLICATE_VALUE]: ErrorSeverity.LOW,
      [ErrorType.BUSINESS_RULE_VIOLATION]: ErrorSeverity.MEDIUM,
      [ErrorType.INSUFFICIENT_PERMISSIONS]: ErrorSeverity.MEDIUM,
      [ErrorType.RESOURCE_NOT_FOUND]: ErrorSeverity.MEDIUM,
      [ErrorType.RESOURCE_CONFLICT]: ErrorSeverity.MEDIUM,
      [ErrorType.RATE_LIMIT_EXCEEDED]: ErrorSeverity.MEDIUM,
      [ErrorType.INTERNAL_SERVER_ERROR]: ErrorSeverity.CRITICAL,
      [ErrorType.SERVICE_UNAVAILABLE]: ErrorSeverity.HIGH,
      [ErrorType.DATABASE_ERROR]: ErrorSeverity.CRITICAL,
      [ErrorType.CONFIGURATION_ERROR]: ErrorSeverity.HIGH,
      [ErrorType.INVALID_INPUT]: ErrorSeverity.LOW,
      [ErrorType.MISSING_INPUT]: ErrorSeverity.LOW,
      [ErrorType.INVALID_FILE_TYPE]: ErrorSeverity.LOW,
      [ErrorType.FILE_TOO_LARGE]: ErrorSeverity.LOW,
      [ErrorType.EXTERNAL_API_ERROR]: ErrorSeverity.MEDIUM,
      [ErrorType.EXTERNAL_SERVICE_DOWN]: ErrorSeverity.HIGH,
      [ErrorType.EXTERNAL_RATE_LIMIT]: ErrorSeverity.MEDIUM,
      [ErrorType.UNKNOWN_ERROR]: ErrorSeverity.MEDIUM
    };
    
    return severityMap[type] || ErrorSeverity.MEDIUM;
  }

  private isRetryableByType(type: ErrorType): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.CONNECTION_ERROR,
      ErrorType.TOKEN_EXPIRED,
      ErrorType.SERVICE_UNAVAILABLE,
      ErrorType.EXTERNAL_API_ERROR,
      ErrorType.EXTERNAL_SERVICE_DOWN
    ];
    
    return retryableTypes.includes(type);
  }

  private getErrorCodeFromType(type: ErrorType): string {
    return type.toUpperCase();
  }

  private addToErrorHistory(error: AppError): void {
    this.errorHistory.push(error);
    
    // Trim history if it exceeds max size
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.config.maxErrorHistory);
    }
  }

  private updateAnalytics(error: AppError): void {
    this.analytics.totalErrors++;
    this.analytics.errorsByType[error.type] = (this.analytics.errorsByType[error.type] || 0) + 1;
    this.analytics.errorsByCategory[error.category] = (this.analytics.errorsByCategory[error.category] || 0) + 1;
    this.analytics.errorsBySeverity[error.severity] = (this.analytics.errorsBySeverity[error.severity] || 0) + 1;
  }

  private initializeAnalytics(): ErrorAnalytics {
    return {
      totalErrors: 0,
      errorsByType: {} as Record<ErrorType, number>,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      errorsByComponent: {},
      errorsByUser: {},
      errorRate: 0,
      averageErrorFrequency: 0,
      mostCommonErrors: [],
      errorTrends: [],
      recoveryRate: 0,
      averageRecoveryTime: 0
    };
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserActions(): string[] {
    // This would track user actions leading to the error
    return [];
  }

  private getAdditionalInfo(): string {
    // This would provide additional context about the error
    return '';
  }

  private getAttachments(): Array<{ name: string; type: string; size: number; data: string }> {
    // This would provide file attachments related to the error
    return [];
  }

  private getErrorTitle(error: AppError): string {
    const titleMap: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: 'Network Error',
      [ErrorType.TIMEOUT_ERROR]: 'Request Timeout',
      [ErrorType.CONNECTION_ERROR]: 'Connection Error',
      [ErrorType.DNS_ERROR]: 'DNS Error',
      [ErrorType.UNAUTHORIZED]: 'Unauthorized Access',
      [ErrorType.FORBIDDEN]: 'Access Denied',
      [ErrorType.TOKEN_EXPIRED]: 'Session Expired',
      [ErrorType.INVALID_CREDENTIALS]: 'Invalid Credentials',
      [ErrorType.ACCOUNT_LOCKED]: 'Account Locked',
      [ErrorType.ACCOUNT_DISABLED]: 'Account Disabled',
      [ErrorType.VALIDATION_ERROR]: 'Validation Error',
      [ErrorType.REQUIRED_FIELD]: 'Required Field Missing',
      [ErrorType.INVALID_FORMAT]: 'Invalid Format',
      [ErrorType.INVALID_VALUE]: 'Invalid Value',
      [ErrorType.DUPLICATE_VALUE]: 'Duplicate Value',
      [ErrorType.BUSINESS_RULE_VIOLATION]: 'Business Rule Violation',
      [ErrorType.INSUFFICIENT_PERMISSIONS]: 'Insufficient Permissions',
      [ErrorType.RESOURCE_NOT_FOUND]: 'Resource Not Found',
      [ErrorType.RESOURCE_CONFLICT]: 'Resource Conflict',
      [ErrorType.RATE_LIMIT_EXCEEDED]: 'Rate Limit Exceeded',
      [ErrorType.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [ErrorType.SERVICE_UNAVAILABLE]: 'Service Unavailable',
      [ErrorType.DATABASE_ERROR]: 'Database Error',
      [ErrorType.CONFIGURATION_ERROR]: 'Configuration Error',
      [ErrorType.INVALID_INPUT]: 'Invalid Input',
      [ErrorType.MISSING_INPUT]: 'Missing Input',
      [ErrorType.INVALID_FILE_TYPE]: 'Invalid File Type',
      [ErrorType.FILE_TOO_LARGE]: 'File Too Large',
      [ErrorType.EXTERNAL_API_ERROR]: 'External API Error',
      [ErrorType.EXTERNAL_SERVICE_DOWN]: 'External Service Down',
      [ErrorType.EXTERNAL_RATE_LIMIT]: 'External Rate Limit',
      [ErrorType.UNKNOWN_ERROR]: 'Unknown Error'
    };
    
    return titleMap[error.type] || 'Error';
  }

  private getErrorNotificationType(error: AppError): 'error' | 'warning' | 'info' | 'success' {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  private getErrorNotificationDuration(error: AppError): number {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return this.config.criticalErrorNotificationTimeout;
      case ErrorSeverity.HIGH:
        return this.config.errorNotificationTimeout;
      case ErrorSeverity.MEDIUM:
        return this.config.errorNotificationTimeout / 2;
      case ErrorSeverity.LOW:
        return this.config.errorNotificationTimeout / 4;
      default:
        return this.config.errorNotificationTimeout;
    }
  }

  private getErrorNotificationActions(error: AppError): Array<{ label: string; action: () => void; primary?: boolean }> {
    const actions = [];
    
    if (this.isRetryable(error)) {
      actions.push({
        label: 'Retry',
        action: () => this.handleRecovery(error, this.getCurrentContext()),
        primary: true
      });
    }
    
    actions.push({
      label: 'Dismiss',
      action: () => this.dismissNotification(error.id)
    });
    
    return actions;
  }

  private showNotification(notification: ErrorNotification): void {
    // This would show the notification to the user
    console.log('Error notification:', notification);
  }

  private dismissNotification(errorId: string): void {
    const notification = this.notifications.find(n => n.error.id === errorId);
    if (notification) {
      notification.dismissed = true;
    }
  }

  // Recovery methods for different error types
  private async handleNetworkErrorRecovery(error: AppError, context: ErrorContext): Promise<ErrorRecovery> {
    // Implement network error recovery logic
    return {
      errorId: error.id,
      recoveryType: 'retry',
      recoveryAction: 'retry_request',
      success: true,
      timestamp: Date.now(),
      duration: 0
    };
  }

  private async handleAuthenticationErrorRecovery(error: AppError, context: ErrorContext): Promise<ErrorRecovery> {
    // Implement authentication error recovery logic
    return {
      errorId: error.id,
      recoveryType: 'redirect',
      recoveryAction: 'redirect_to_login',
      success: true,
      timestamp: Date.now(),
      duration: 0
    };
  }

  private async handleRateLimitErrorRecovery(error: AppError, context: ErrorContext): Promise<ErrorRecovery> {
    // Implement rate limit error recovery logic
    return {
      errorId: error.id,
      recoveryType: 'retry',
      recoveryAction: 'wait_and_retry',
      success: true,
      timestamp: Date.now(),
      duration: 0
    };
  }

  private async handleServiceUnavailableErrorRecovery(error: AppError, context: ErrorContext): Promise<ErrorRecovery> {
    // Implement service unavailable error recovery logic
    return {
      errorId: error.id,
      recoveryType: 'retry',
      recoveryAction: 'retry_with_backoff',
      success: true,
      timestamp: Date.now(),
      duration: 0
    };
  }

  private async handleGenericErrorRecovery(error: AppError, context: ErrorContext): Promise<ErrorRecovery> {
    // Implement generic error recovery logic
    return {
      errorId: error.id,
      recoveryType: 'manual',
      recoveryAction: 'user_intervention_required',
      success: false,
      timestamp: Date.now(),
      duration: 0
    };
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  getRecoveryHistory(): ErrorRecovery[] {
    return [...this.recoveryHistory];
  }

  getAnalytics(): ErrorAnalytics {
    return { ...this.analytics };
  }

  getNotifications(): ErrorNotification[] {
    return [...this.notifications];
  }

  getConfig(): ErrorHandlingConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<ErrorHandlingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  clearRecoveryHistory(): void {
    this.recoveryHistory = [];
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  destroy(): void {
    this.errorHistory = [];
    this.recoveryHistory = [];
    this.notifications = [];
    this.isInitialized = false;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const errorHandler = new ErrorHandlerService();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function getErrorHandler(): ErrorHandlerService {
  return errorHandler;
}

export function handleError(error: AppError, context: ErrorContext): Promise<void> {
  return errorHandler.handleError(error, context);
}

export function createError(type: ErrorType, message: string, context?: Partial<ErrorContext>): AppError {
  return errorHandler.createError(type, message, context);
}

export function createNetworkError(message: string, url?: string, statusCode?: number): AppError {
  return errorHandler.createNetworkError(message, url, statusCode);
}

export function createAuthenticationError(type: ErrorType, message: string, userId?: string): AppError {
  return errorHandler.createAuthenticationError(type, message, userId);
}

export function createValidationError(type: ErrorType, message: string, field?: string): AppError {
  return errorHandler.createValidationError(type, message, field);
}

export function createBusinessLogicError(type: ErrorType, message: string, resourceId?: string): AppError {
  return errorHandler.createBusinessLogicError(type, message, resourceId);
}

export function createSystemError(type: ErrorType, message: string, component?: string): AppError {
  return errorHandler.createSystemError(type, message, component);
}

export function createUserInputError(type: ErrorType, message: string, inputField?: string): AppError {
  return errorHandler.createUserInputError(type, message, inputField);
}

export function createExternalServiceError(type: ErrorType, message: string, serviceName?: string): AppError {
  return errorHandler.createExternalServiceError(type, message, serviceName);
}

export function createUnknownError(message: string, originalError?: any): AppError {
  return errorHandler.createUnknownError(message, originalError);
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default errorHandler;
