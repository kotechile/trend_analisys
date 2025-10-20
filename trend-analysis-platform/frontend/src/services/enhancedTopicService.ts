/**
 * Enhanced Topics Service
 * Frontend service for Google Autocomplete integration with topic decomposition
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  EnhancedTopicDecompositionRequest,
  EnhancedTopicDecompositionResponse,
  AutocompleteRequest,
  AutocompleteResponse,
  MethodComparisonRequest,
  MethodComparisonResponse,
  ErrorResponse,
  ApiResponse,
  EnhancedTopicsService,
  AutocompleteService
} from '../../../../shared/types/enhanced-topics';

/**
 * Enhanced Topics API Service
 * Handles communication with the enhanced topics backend API
 */
export class EnhancedTopicsApiService implements EnhancedTopicsService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = '/api/enhanced-topics') {
    this.baseUrl = baseUrl;
    this.api = axios.create({
      baseURL: baseUrl,
      timeout: 90000, // 90 seconds to allow for LLM processing
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[EnhancedTopics] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[EnhancedTopics] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[EnhancedTopics] Response:`, response.status, response.data);
        return response;
      },
      (error) => {
        console.error('[EnhancedTopics] Response error:', error);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * Decompose topic using enhanced approach
   */
  async decomposeTopic(
    request: EnhancedTopicDecompositionRequest
  ): Promise<EnhancedTopicDecompositionResponse> {
    try {
      const response: AxiosResponse<EnhancedTopicDecompositionResponse> = await this.api.post(
        '/decompose',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query: string): Promise<AutocompleteResponse> {
    try {
      const response: AxiosResponse<AutocompleteResponse> = await this.api.get(
        `/autocomplete/${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Compare different decomposition methods
   */
  async compareMethods(
    request: MethodComparisonRequest
  ): Promise<MethodComparisonResponse> {
    try {
      const response: AxiosResponse<MethodComparisonResponse> = await this.api.post(
        '/compare-methods',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    try {
      await this.api.post('/cache/clear');
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<Record<string, any>> {
    try {
      const response: AxiosResponse<Record<string, any>> = await this.api.get('/cache/stats');
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || `HTTP ${status}`;
      return new Error(`API Error (${status}): ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network Error: No response from server');
    } else {
      // Something else happened
      return new Error(`Request Error: ${error.message}`);
    }
  }
}

// REMOVED: AutocompleteApiService - Google Autocomplete API was causing rate limiting and CORS issues

/**
 * Service Factory
 * Creates service instances with proper configuration
 */
export class EnhancedTopicsServiceFactory {
  private static instance: EnhancedTopicsApiService | null = null;

  /**
   * Get singleton instance of Enhanced Topics API Service
   */
  static getInstance(baseUrl?: string): EnhancedTopicsApiService {
    if (!this.instance) {
      this.instance = new EnhancedTopicsApiService(baseUrl);
    }
    return this.instance;
  }

  /**
   * Reset singleton instances (useful for testing)
   */
  static resetInstances(): void {
    this.instance = null;
  }
}

/**
 * Default service instances
 */
export const enhancedTopicsService = EnhancedTopicsServiceFactory.getInstance();
export const autocompleteService = EnhancedTopicsServiceFactory.getAutocompleteInstance();

/**
 * Utility functions for service usage
 */
export const serviceUtils = {
  /**
   * Check if an error is a rate limit error
   */
  isRateLimitError(error: Error): boolean {
    return error.message.includes('429') || error.message.includes('rate limit');
  },

  /**
   * Check if an error is a network error
   */
  isNetworkError(error: Error): boolean {
    return error.message.includes('Network Error') || error.message.includes('No response');
  },

  /**
   * Check if an error is a timeout error
   */
  isTimeoutError(error: Error): boolean {
    return error.message.includes('timeout') || error.message.includes('Timeout');
  },

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: Error): string {
    if (this.isRateLimitError(error)) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (this.isNetworkError(error)) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (this.isTimeoutError(error)) {
      return 'Request timed out. Please try again.';
    }
    return error.message || 'An unexpected error occurred.';
  },

  /**
   * Retry function with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
};

export default enhancedTopicsService;
