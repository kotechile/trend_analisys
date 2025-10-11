/**
 * Error Handling Utilities
 * Centralized error handling for API calls and user interactions
 */

import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Converts API errors to user-friendly error messages
 */
export const formatApiError = (error: unknown): UserFriendlyError => {
  if (error instanceof AxiosError) {
    const { response, request, message } = error;

    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      switch (status) {
        case 400:
          return {
            title: 'Invalid Request',
            message: data?.message || 'Please check your input and try again.',
            action: 'Please review your input',
            severity: 'warning',
          };
        case 401:
          return {
            title: 'Authentication Required',
            message: 'Please log in to continue.',
            action: 'Log in',
            severity: 'error',
          };
        case 403:
          return {
            title: 'Access Denied',
            message: 'You don\'t have permission to perform this action.',
            action: 'Contact support',
            severity: 'error',
          };
        case 404:
          return {
            title: 'Not Found',
            message: 'The requested resource was not found.',
            action: 'Try again',
            severity: 'warning',
          };
        case 429:
          return {
            title: 'Too Many Requests',
            message: 'Please wait a moment before trying again.',
            action: 'Wait and retry',
            severity: 'warning',
          };
        case 500:
          return {
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again later.',
            action: 'Try again later',
            severity: 'error',
          };
        default:
          return {
            title: 'Request Failed',
            message: data?.message || `Request failed with status ${status}`,
            action: 'Try again',
            severity: 'error',
          };
      }
    } else if (request) {
      // Network error
      return {
        title: 'Network Error',
        message: 'Please check your internet connection and try again.',
        action: 'Check connection',
        severity: 'error',
      };
    } else {
      // Other error
      return {
        title: 'Request Error',
        message: message || 'An unexpected error occurred.',
        action: 'Try again',
        severity: 'error',
      };
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
      action: 'Try again',
      severity: 'error',
    };
  }

  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Try again',
    severity: 'error',
  };
};

/**
 * Logs errors for debugging and monitoring
 */
export const logError = (error: unknown, context?: string) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };

  console.error('Error logged:', errorInfo);

  // In production, you would send this to an error monitoring service
  // Example: errorMonitoringService.captureException(error, { context, timestamp });
};

/**
 * Handles workflow-specific errors
 */
export const handleWorkflowError = (error: unknown, step: string): UserFriendlyError => {
  const baseError = formatApiError(error);
  
  // Add workflow-specific context
  return {
    ...baseError,
    title: `${step} Error`,
    message: `${baseError.message} (Step: ${step})`,
  };
};

/**
 * Retry configuration for different types of operations
 */
export const getRetryConfig = (operation: string) => {
  const configs = {
    'topic-decomposition': { retries: 2, delay: 1000 },
    'affiliate-research': { retries: 3, delay: 2000 },
    'trend-analysis': { retries: 2, delay: 1500 },
    'content-generation': { retries: 2, delay: 2000 },
    'keyword-clustering': { retries: 1, delay: 1000 },
    'external-tools': { retries: 1, delay: 3000 },
    'default': { retries: 1, delay: 1000 },
  };

  return configs[operation as keyof typeof configs] || configs.default;
};

/**
 * Determines if an error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const { response } = error;
    
    if (response) {
      const { status } = response;
      // Retry on server errors and rate limiting
      return status >= 500 || status === 429;
    }
    
    // Retry on network errors
    return true;
  }
  
  return false;
};

/**
 * Creates a retry function with exponential backoff
 */
export const createRetryFunction = <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
) => {
  return async (): Promise<T> => {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !isRetryableError(error)) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
};
