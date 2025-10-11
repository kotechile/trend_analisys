/**
 * Error Recovery Service for the Trend Analysis Platform.
 * 
 * This service provides automatic error recovery mechanisms,
 * retry logic, and fallback strategies for various error types.
 */

import { 
  AppError, 
  ErrorType, 
  ErrorSeverity, 
  ErrorContext, 
  ErrorRecovery, 
  ErrorHandlingConfig 
} from '../types/errors';
import { errorHandler } from './errorHandler';
import { apiConfig } from './apiConfig';

// =============================================================================
// RECOVERY STRATEGIES
// =============================================================================

export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  REDIRECT = 'redirect',
  REFRESH = 'refresh',
  RELOAD = 'reload',
  MANUAL = 'manual'
}

export interface RecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  retryBackoffMultiplier: number;
  maxRetryDelay: number;
  enableExponentialBackoff: boolean;
  enableJitter: boolean;
  fallbackTimeout: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  enableGracefulDegradation: boolean;
  enableUserNotification: boolean;
  enableErrorReporting: boolean;
}

export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategy;
  attempts: number;
  duration: number;
  error?: AppError;
  fallbackData?: any;
  redirectUrl?: string;
  message?: string;
}

// =============================================================================
// ERROR RECOVERY SERVICE
// =============================================================================

export class ErrorRecoveryService {
  private config: RecoveryConfig;
  private retryAttempts: Map<string, number>;
  private circuitBreakers: Map<string, { failures: number; lastFailure: number; isOpen: boolean }>;
  private healthChecks: Map<string, { lastCheck: number; isHealthy: boolean }>;
  private recoveryHistory: ErrorRecovery[];

  constructor(config?: Partial<RecoveryConfig>) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      retryBackoffMultiplier: 2,
      maxRetryDelay: 30000,
      enableExponentialBackoff: true,
      enableJitter: true,
      fallbackTimeout: 5000,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      enableHealthChecks: true,
      healthCheckInterval: 30000,
      enableGracefulDegradation: true,
      enableUserNotification: true,
      enableErrorReporting: true,
      ...config
    };
    
    this.retryAttempts = new Map();
    this.circuitBreakers = new Map();
    this.healthChecks = new Map();
    this.recoveryHistory = [];
    
    this.startHealthChecks();
  }

  // =============================================================================
  // MAIN RECOVERY METHOD
  // =============================================================================

  async recover(error: AppError, context: ErrorContext): Promise<RecoveryResult> {
    const startTime = Date.now();
    const errorKey = this.getErrorKey(error, context);
    
    try {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(errorKey)) {
        return this.handleCircuitBreakerOpen(error, context);
      }
      
      // Determine recovery strategy
      const strategy = this.determineRecoveryStrategy(error, context);
      
      // Execute recovery
      const result = await this.executeRecovery(error, context, strategy);
      
      // Record recovery attempt
      this.recordRecoveryAttempt(error, context, strategy, result);
      
      // Update circuit breaker
      this.updateCircuitBreaker(errorKey, result.success);
      
      return {
        ...result,
        duration: Date.now() - startTime
      };
      
    } catch (recoveryError) {
      const result: RecoveryResult = {
        success: false,
        strategy: RecoveryStrategy.MANUAL,
        attempts: this.getRetryAttempts(errorKey),
        duration: Date.now() - startTime,
        error: this.createRecoveryError(recoveryError),
        message: 'Recovery failed'
      };
      
      this.recordRecoveryAttempt(error, context, RecoveryStrategy.MANUAL, result);
      return result;
    }
  }

  // =============================================================================
  // RECOVERY STRATEGY DETERMINATION
  // =============================================================================

  private determineRecoveryStrategy(error: AppError, context: ErrorContext): RecoveryStrategy {
    // Check if error is retryable
    if (this.isRetryableError(error)) {
      const retryAttempts = this.getRetryAttempts(this.getErrorKey(error, context));
      if (retryAttempts < this.config.maxRetries) {
        return RecoveryStrategy.RETRY;
      }
    }
    
    // Check for specific error types
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
      case ErrorType.CONNECTION_ERROR:
        return RecoveryStrategy.RETRY;
        
      case ErrorType.UNAUTHORIZED:
      case ErrorType.TOKEN_EXPIRED:
        return RecoveryStrategy.REDIRECT;
        
      case ErrorType.SERVICE_UNAVAILABLE:
        return RecoveryStrategy.FALLBACK;
        
      case ErrorType.RATE_LIMIT_EXCEEDED:
        return RecoveryStrategy.RETRY;
        
      case ErrorType.INTERNAL_SERVER_ERROR:
        return RecoveryStrategy.REFRESH;
        
      case ErrorType.DATABASE_ERROR:
        return RecoveryStrategy.FALLBACK;
        
      case ErrorType.CONFIGURATION_ERROR:
        return RecoveryStrategy.RELOAD;
        
      default:
        return RecoveryStrategy.MANUAL;
    }
  }

  // =============================================================================
  // RECOVERY EXECUTION
  // =============================================================================

  private async executeRecovery(
    error: AppError, 
    context: ErrorContext, 
    strategy: RecoveryStrategy
  ): Promise<RecoveryResult> {
    const errorKey = this.getErrorKey(error, context);
    const attempts = this.getRetryAttempts(errorKey);
    
    switch (strategy) {
      case RecoveryStrategy.RETRY:
        return this.executeRetry(error, context, attempts);
        
      case RecoveryStrategy.FALLBACK:
        return this.executeFallback(error, context);
        
      case RecoveryStrategy.REDIRECT:
        return this.executeRedirect(error, context);
        
      case RecoveryStrategy.REFRESH:
        return this.executeRefresh(error, context);
        
      case RecoveryStrategy.RELOAD:
        return this.executeReload(error, context);
        
      case RecoveryStrategy.MANUAL:
        return this.executeManual(error, context);
        
      default:
        return this.executeManual(error, context);
    }
  }

  private async executeRetry(error: AppError, context: ErrorContext, attempts: number): Promise<RecoveryResult> {
    const errorKey = this.getErrorKey(error, context);
    const retryDelay = this.calculateRetryDelay(attempts);
    
    // Wait before retry
    await this.wait(retryDelay);
    
    // Increment retry attempts
    this.incrementRetryAttempts(errorKey);
    
    try {
      // Attempt to retry the operation
      const success = await this.retryOperation(error, context);
      
      if (success) {
        this.resetRetryAttempts(errorKey);
        return {
          success: true,
          strategy: RecoveryStrategy.RETRY,
          attempts: attempts + 1,
          duration: 0,
          message: 'Operation retried successfully'
        };
      } else {
        throw new Error('Retry operation failed');
      }
      
    } catch (retryError) {
      return {
        success: false,
        strategy: RecoveryStrategy.RETRY,
        attempts: attempts + 1,
        duration: 0,
        error: this.createRecoveryError(retryError),
        message: 'Retry operation failed'
      };
    }
  }

  private async executeFallback(error: AppError, context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Attempt to get fallback data
      const fallbackData = await this.getFallbackData(error, context);
      
      return {
        success: true,
        strategy: RecoveryStrategy.FALLBACK,
        attempts: 0,
        duration: 0,
        fallbackData,
        message: 'Fallback data retrieved successfully'
      };
      
    } catch (fallbackError) {
      return {
        success: false,
        strategy: RecoveryStrategy.FALLBACK,
        attempts: 0,
        duration: 0,
        error: this.createRecoveryError(fallbackError),
        message: 'Fallback operation failed'
      };
    }
  }

  private async executeRedirect(error: AppError, context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Determine redirect URL
      const redirectUrl = this.getRedirectUrl(error, context);
      
      // Perform redirect
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
      
      return {
        success: true,
        strategy: RecoveryStrategy.REDIRECT,
        attempts: 0,
        duration: 0,
        redirectUrl,
        message: 'Redirected successfully'
      };
      
    } catch (redirectError) {
      return {
        success: false,
        strategy: RecoveryStrategy.REDIRECT,
        attempts: 0,
        duration: 0,
        error: this.createRecoveryError(redirectError),
        message: 'Redirect operation failed'
      };
    }
  }

  private async executeRefresh(error: AppError, context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Refresh the page
      window.location.reload();
      
      return {
        success: true,
        strategy: RecoveryStrategy.REFRESH,
        attempts: 0,
        duration: 0,
        message: 'Page refreshed successfully'
      };
      
    } catch (refreshError) {
      return {
        success: false,
        strategy: RecoveryStrategy.REFRESH,
        attempts: 0,
        duration: 0,
        error: this.createRecoveryError(refreshError),
        message: 'Refresh operation failed'
      };
    }
  }

  private async executeReload(error: AppError, context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Reload the application
      window.location.href = window.location.href;
      
      return {
        success: true,
        strategy: RecoveryStrategy.RELOAD,
        attempts: 0,
        duration: 0,
        message: 'Application reloaded successfully'
      };
      
    } catch (reloadError) {
      return {
        success: false,
        strategy: RecoveryStrategy.RELOAD,
        attempts: 0,
        duration: 0,
        error: this.createRecoveryError(reloadError),
        message: 'Reload operation failed'
      };
    }
  }

  private async executeManual(error: AppError, context: ErrorContext): Promise<RecoveryResult> {
    // Notify user that manual intervention is required
    if (this.config.enableUserNotification) {
      this.notifyUser(error, context);
    }
    
    return {
      success: false,
      strategy: RecoveryStrategy.MANUAL,
      attempts: 0,
      duration: 0,
      message: 'Manual intervention required'
    };
  }

  // =============================================================================
  // RECOVERY HELPERS
  // =============================================================================

  private async retryOperation(error: AppError, context: ErrorContext): Promise<boolean> {
    // This would implement the actual retry logic
    // For now, we'll simulate a retry attempt
    return Math.random() > 0.5; // 50% success rate for simulation
  }

  private async getFallbackData(error: AppError, context: ErrorContext): Promise<any> {
    // This would implement fallback data retrieval
    // For now, we'll return a default response
    return {
      message: 'Fallback data',
      timestamp: Date.now(),
      source: 'fallback'
    };
  }

  private getRedirectUrl(error: AppError, context: ErrorContext): string | null {
    switch (error.type) {
      case ErrorType.UNAUTHORIZED:
      case ErrorType.TOKEN_EXPIRED:
        return '/login';
      case ErrorType.FORBIDDEN:
        return '/unauthorized';
      case ErrorType.ACCOUNT_LOCKED:
      case ErrorType.ACCOUNT_DISABLED:
        return '/account-disabled';
      default:
        return null;
    }
  }

  private notifyUser(error: AppError, context: ErrorContext): void {
    // This would show a notification to the user
    console.log('Manual intervention required:', error.message);
  }

  // =============================================================================
  // CIRCUIT BREAKER
  // =============================================================================

  private isCircuitBreakerOpen(errorKey: string): boolean {
    if (!this.config.enableCircuitBreaker) {
      return false;
    }
    
    const circuitBreaker = this.circuitBreakers.get(errorKey);
    if (!circuitBreaker) {
      return false;
    }
    
    const now = Date.now();
    const timeSinceLastFailure = now - circuitBreaker.lastFailure;
    
    if (circuitBreaker.isOpen && timeSinceLastFailure > this.config.circuitBreakerTimeout) {
      // Reset circuit breaker
      circuitBreaker.isOpen = false;
      circuitBreaker.failures = 0;
      return false;
    }
    
    return circuitBreaker.isOpen;
  }

  private updateCircuitBreaker(errorKey: string, success: boolean): void {
    if (!this.config.enableCircuitBreaker) {
      return;
    }
    
    let circuitBreaker = this.circuitBreakers.get(errorKey);
    if (!circuitBreaker) {
      circuitBreaker = {
        failures: 0,
        lastFailure: 0,
        isOpen: false
      };
      this.circuitBreakers.set(errorKey, circuitBreaker);
    }
    
    if (success) {
      circuitBreaker.failures = 0;
      circuitBreaker.isOpen = false;
    } else {
      circuitBreaker.failures++;
      circuitBreaker.lastFailure = Date.now();
      
      if (circuitBreaker.failures >= this.config.circuitBreakerThreshold) {
        circuitBreaker.isOpen = true;
      }
    }
  }

  private handleCircuitBreakerOpen(error: AppError, context: ErrorContext): RecoveryResult {
    return {
      success: false,
      strategy: RecoveryStrategy.MANUAL,
      attempts: 0,
      duration: 0,
      message: 'Circuit breaker is open'
    };
  }

  // =============================================================================
  // HEALTH CHECKS
  // =============================================================================

  private startHealthChecks(): void {
    if (!this.config.enableHealthChecks) {
      return;
    }
    
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = Array.from(this.healthChecks.keys()).map(async (service) => {
      try {
        const isHealthy = await this.checkServiceHealth(service);
        this.healthChecks.set(service, {
          lastCheck: Date.now(),
          isHealthy
        });
      } catch (error) {
        this.healthChecks.set(service, {
          lastCheck: Date.now(),
          isHealthy: false
        });
      }
    });
    
    await Promise.all(healthCheckPromises);
  }

  private async checkServiceHealth(service: string): Promise<boolean> {
    // This would implement actual health checks
    // For now, we'll simulate health checks
    return Math.random() > 0.1; // 90% success rate for simulation
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private getErrorKey(error: AppError, context: ErrorContext): string {
    return `${error.type}_${context.component}_${context.action}`;
  }

  private getRetryAttempts(errorKey: string): number {
    return this.retryAttempts.get(errorKey) || 0;
  }

  private incrementRetryAttempts(errorKey: string): void {
    const current = this.getRetryAttempts(errorKey);
    this.retryAttempts.set(errorKey, current + 1);
  }

  private resetRetryAttempts(errorKey: string): void {
    this.retryAttempts.delete(errorKey);
  }

  private calculateRetryDelay(attempts: number): number {
    let delay = this.config.retryDelay;
    
    if (this.config.enableExponentialBackoff) {
      delay = Math.min(
        delay * Math.pow(this.config.retryBackoffMultiplier, attempts),
        this.config.maxRetryDelay
      );
    }
    
    if (this.config.enableJitter) {
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      delay += jitter;
    }
    
    return delay;
  }

  private isRetryableError(error: AppError): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.CONNECTION_ERROR,
      ErrorType.TOKEN_EXPIRED,
      ErrorType.SERVICE_UNAVAILABLE,
      ErrorType.RATE_LIMIT_EXCEEDED,
      ErrorType.INTERNAL_SERVER_ERROR,
      ErrorType.EXTERNAL_API_ERROR,
      ErrorType.EXTERNAL_SERVICE_DOWN
    ];
    
    return retryableTypes.includes(error.type);
  }

  private createRecoveryError(error: any): AppError {
    return errorHandler.createUnknownError(
      error instanceof Error ? error.message : String(error),
      error
    );
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private recordRecoveryAttempt(
    error: AppError, 
    context: ErrorContext, 
    strategy: RecoveryStrategy, 
    result: RecoveryResult
  ): void {
    const recovery: ErrorRecovery = {
      errorId: error.id,
      recoveryType: strategy,
      recoveryAction: this.getRecoveryAction(strategy),
      success: result.success,
      timestamp: Date.now(),
      duration: result.duration,
      error: result.error
    };
    
    this.recoveryHistory.push(recovery);
    
    // Trim history if it gets too large
    if (this.recoveryHistory.length > 1000) {
      this.recoveryHistory = this.recoveryHistory.slice(-1000);
    }
  }

  private getRecoveryAction(strategy: RecoveryStrategy): string {
    const actionMap: Record<RecoveryStrategy, string> = {
      [RecoveryStrategy.RETRY]: 'retry_operation',
      [RecoveryStrategy.FALLBACK]: 'use_fallback_data',
      [RecoveryStrategy.REDIRECT]: 'redirect_user',
      [RecoveryStrategy.REFRESH]: 'refresh_page',
      [RecoveryStrategy.RELOAD]: 'reload_application',
      [RecoveryStrategy.MANUAL]: 'require_manual_intervention'
    };
    
    return actionMap[strategy] || 'unknown_action';
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  getRecoveryHistory(): ErrorRecovery[] {
    return [...this.recoveryHistory];
  }

  getCircuitBreakerStatus(): Record<string, { failures: number; isOpen: boolean; lastFailure: number }> {
    const status: Record<string, { failures: number; isOpen: boolean; lastFailure: number }> = {};
    
    for (const [key, circuitBreaker] of this.circuitBreakers.entries()) {
      status[key] = {
        failures: circuitBreaker.failures,
        isOpen: circuitBreaker.isOpen,
        lastFailure: circuitBreaker.lastFailure
      };
    }
    
    return status;
  }

  getHealthCheckStatus(): Record<string, { lastCheck: number; isHealthy: boolean }> {
    const status: Record<string, { lastCheck: number; isHealthy: boolean }> = {};
    
    for (const [key, healthCheck] of this.healthChecks.entries()) {
      status[key] = {
        lastCheck: healthCheck.lastCheck,
        isHealthy: healthCheck.isHealthy
      };
    }
    
    return status;
  }

  getConfig(): RecoveryConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  reset(): void {
    this.retryAttempts.clear();
    this.circuitBreakers.clear();
    this.healthChecks.clear();
    this.recoveryHistory = [];
  }

  destroy(): void {
    this.reset();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const errorRecovery = new ErrorRecoveryService();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function getErrorRecovery(): ErrorRecoveryService {
  return errorRecovery;
}

export function recover(error: AppError, context: ErrorContext): Promise<RecoveryResult> {
  return errorRecovery.recover(error, context);
}

export function getRecoveryHistory(): ErrorRecovery[] {
  return errorRecovery.getRecoveryHistory();
}

export function getCircuitBreakerStatus(): Record<string, { failures: number; isOpen: boolean; lastFailure: number }> {
  return errorRecovery.getCircuitBreakerStatus();
}

export function getHealthCheckStatus(): Record<string, { lastCheck: number; isHealthy: boolean }> {
  return errorRecovery.getHealthCheckStatus();
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default errorRecovery;
