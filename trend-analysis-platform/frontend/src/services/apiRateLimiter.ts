/**
 * API Rate Limiter Service for the Trend Analysis Platform.
 * 
 * This service provides rate limiting functionality for API requests,
 * preventing excessive requests and ensuring fair usage.
 */

import { AxiosRequestConfig } from 'axios';
import { apiConfig } from './apiConfig';

// =============================================================================
// RATE LIMITER TYPES
// =============================================================================

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  enableBurstMode: boolean;
  burstLimit: number;
  enableRetryAfter: boolean;
  retryAfterMs: number;
  enableQueue: boolean;
  maxQueueSize: number;
  enableBackoff: boolean;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

export interface RateLimitStats {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  queuedRequests: number;
  currentWindow: number;
  requestsInWindow: number;
  nextResetTime: number;
  averageRequestRate: number;
  peakRequestRate: number;
}

export interface QueuedRequest {
  id: string;
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  retryCount: number;
  priority: number;
}

// =============================================================================
// API RATE LIMITER SERVICE
// =============================================================================

export class ApiRateLimiterService {
  private config: RateLimitConfig;
  private stats: RateLimitStats;
  private requestHistory: Map<number, number>;
  private requestQueue: QueuedRequest[];
  private currentWindow: number;
  private windowStartTime: number;
  private isProcessingQueue: boolean;
  private backoffUntil: number;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxRequests: 100,
      windowMs: 60000, // 1 minute
      enableBurstMode: true,
      burstLimit: 10,
      enableRetryAfter: true,
      retryAfterMs: 1000,
      enableQueue: true,
      maxQueueSize: 50,
      enableBackoff: true,
      backoffMultiplier: 2,
      maxBackoffMs: 30000,
      ...config
    };
    
    this.stats = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      queuedRequests: 0,
      currentWindow: 0,
      requestsInWindow: 0,
      nextResetTime: 0,
      averageRequestRate: 0,
      peakRequestRate: 0
    };
    
    this.requestHistory = new Map();
    this.requestQueue = [];
    this.currentWindow = 0;
    this.windowStartTime = Date.now();
    this.isProcessingQueue = false;
    this.backoffUntil = 0;
    
    this.startWindowReset();
  }

  // =============================================================================
  // RATE LIMITING
  // =============================================================================

  async checkRateLimit(config: AxiosRequestConfig): Promise<boolean> {
    const now = Date.now();
    
    // Check if we're in backoff period
    if (now < this.backoffUntil) {
      this.stats.blockedRequests++;
      return false;
    }
    
    // Update current window
    this.updateCurrentWindow(now);
    
    // Check if request should be allowed
    const isAllowed = this.isRequestAllowed(now);
    
    if (isAllowed) {
      this.recordRequest(now);
      this.stats.allowedRequests++;
      return true;
    } else {
      this.stats.blockedRequests++;
      
      // If queue is enabled, add to queue
      if (this.config.enableQueue && this.requestQueue.length < this.config.maxQueueSize) {
        return this.addToQueue(config);
      }
      
      return false;
    }
  }

  private isRequestAllowed(now: number): boolean {
    const windowStart = this.getWindowStart(now);
    const requestsInWindow = this.getRequestsInWindow(windowStart);
    
    // Check burst mode
    if (this.config.enableBurstMode) {
      const recentRequests = this.getRecentRequests(now, 1000); // Last 1 second
      if (recentRequests >= this.config.burstLimit) {
        return false;
      }
    }
    
    // Check window limit
    return requestsInWindow < this.config.maxRequests;
  }

  private getWindowStart(now: number): number {
    return Math.floor(now / this.config.windowMs) * this.config.windowMs;
  }

  private getRequestsInWindow(windowStart: number): number {
    let count = 0;
    for (const [timestamp, requests] of this.requestHistory.entries()) {
      if (timestamp >= windowStart) {
        count += requests;
      }
    }
    return count;
  }

  private getRecentRequests(now: number, periodMs: number): number {
    const cutoff = now - periodMs;
    let count = 0;
    for (const [timestamp, requests] of this.requestHistory.entries()) {
      if (timestamp >= cutoff) {
        count += requests;
      }
    }
    return count;
  }

  private recordRequest(now: number): void {
    const windowStart = this.getWindowStart(now);
    const currentCount = this.requestHistory.get(windowStart) || 0;
    this.requestHistory.set(windowStart, currentCount + 1);
    
    // Clean up old entries
    this.cleanupOldEntries(now);
  }

  private cleanupOldEntries(now: number): void {
    const cutoff = now - (this.config.windowMs * 2); // Keep 2 windows
    for (const [timestamp] of this.requestHistory.entries()) {
      if (timestamp < cutoff) {
        this.requestHistory.delete(timestamp);
      }
    }
  }

  // =============================================================================
  // REQUEST QUEUE
  // =============================================================================

  private addToQueue(config: AxiosRequestConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: this.generateRequestId(),
        config,
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0,
        priority: this.getRequestPriority(config)
      };
      
      this.requestQueue.push(queuedRequest);
      this.stats.queuedRequests++;
      
      // Sort queue by priority (higher priority first)
      this.requestQueue.sort((a, b) => b.priority - a.priority);
      
      // Process queue if not already processing
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const now = Date.now();
      
      // Check if we can process a request
      if (this.isRequestAllowed(now)) {
        const queuedRequest = this.requestQueue.shift()!;
        this.stats.queuedRequests--;
        
        try {
          const isAllowed = await this.checkRateLimit(queuedRequest.config);
          queuedRequest.resolve(isAllowed);
        } catch (error) {
          queuedRequest.reject(error);
        }
      } else {
        // Wait before trying again
        await this.wait(this.config.retryAfterMs);
      }
    }
    
    this.isProcessingQueue = false;
  }

  private getRequestPriority(config: AxiosRequestConfig): number {
    // Higher priority for certain endpoints
    const url = config.url || '';
    
    if (url.includes('/auth/')) return 10; // Authentication requests
    if (url.includes('/health/')) return 9; // Health checks
    if (url.includes('/users/profile')) return 8; // User profile
    if (url.includes('/users/sessions')) return 7; // User sessions
    if (url.includes('/users/preferences')) return 6; // User preferences
    if (url.includes('/users/activities')) return 5; // User activities
    if (url.includes('/users/analytics')) return 4; // User analytics
    if (url.includes('/users/stats')) return 3; // User stats
    if (url.includes('/users/search')) return 2; // User search
    if (url.includes('/users/suggestions')) return 1; // User suggestions
    
    return 0; // Default priority
  }

  // =============================================================================
  // BACKOFF MECHANISM
  // =============================================================================

  private applyBackoff(): void {
    if (!this.config.enableBackoff) return;
    
    const now = Date.now();
    const backoffTime = Math.min(
      this.config.retryAfterMs * Math.pow(this.config.backoffMultiplier, this.getBackoffLevel()),
      this.config.maxBackoffMs
    );
    
    this.backoffUntil = now + backoffTime;
  }

  private getBackoffLevel(): number {
    // Calculate backoff level based on recent blocked requests
    const now = Date.now();
    const recentBlocked = this.getRecentBlockedRequests(now, 60000); // Last minute
    
    if (recentBlocked < 5) return 0;
    if (recentBlocked < 10) return 1;
    if (recentBlocked < 20) return 2;
    if (recentBlocked < 50) return 3;
    return 4;
  }

  private getRecentBlockedRequests(now: number, periodMs: number): number {
    // This would track blocked requests in a real implementation
    return 0;
  }

  // =============================================================================
  // WINDOW MANAGEMENT
  // =============================================================================

  private updateCurrentWindow(now: number): void {
    const newWindow = this.getWindowStart(now);
    
    if (newWindow !== this.currentWindow) {
      this.currentWindow = newWindow;
      this.windowStartTime = now;
      this.stats.currentWindow = newWindow;
      this.stats.requestsInWindow = 0;
      this.stats.nextResetTime = newWindow + this.config.windowMs;
    }
    
    this.stats.requestsInWindow = this.getRequestsInWindow(newWindow);
  }

  private startWindowReset(): void {
    setInterval(() => {
      const now = Date.now();
      this.updateCurrentWindow(now);
      this.updateStats();
    }, 1000); // Update every second
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  private updateStats(): void {
    this.stats.totalRequests = this.stats.allowedRequests + this.stats.blockedRequests;
    
    // Calculate average request rate
    const now = Date.now();
    const timeElapsed = now - this.windowStartTime;
    if (timeElapsed > 0) {
      this.stats.averageRequestRate = this.stats.requestsInWindow / (timeElapsed / 1000);
    }
    
    // Update peak request rate
    if (this.stats.averageRequestRate > this.stats.peakRequestRate) {
      this.stats.peakRequestRate = this.stats.averageRequestRate;
    }
  }

  getStats(): RateLimitStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      queuedRequests: 0,
      currentWindow: 0,
      requestsInWindow: 0,
      nextResetTime: 0,
      averageRequestRate: 0,
      peakRequestRate: 0
    };
    this.requestHistory.clear();
    this.requestQueue = [];
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setMaxRequests(maxRequests: number): void {
    this.config.maxRequests = maxRequests;
  }

  setWindowMs(windowMs: number): void {
    this.config.windowMs = windowMs;
  }

  setBurstMode(enabled: boolean, burstLimit?: number): void {
    this.config.enableBurstMode = enabled;
    if (burstLimit !== undefined) {
      this.config.burstLimit = burstLimit;
    }
  }

  setQueue(enabled: boolean, maxQueueSize?: number): void {
    this.config.enableQueue = enabled;
    if (maxQueueSize !== undefined) {
      this.config.maxQueueSize = maxQueueSize;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  destroy(): void {
    this.requestHistory.clear();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.backoffUntil = 0;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const apiRateLimiter = new ApiRateLimiterService({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  enableBurstMode: true,
  burstLimit: 10,
  enableRetryAfter: true,
  retryAfterMs: 1000,
  enableQueue: true,
  maxQueueSize: 50,
  enableBackoff: true,
  backoffMultiplier: 2,
  maxBackoffMs: 30000
});

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function getApiRateLimiter(): ApiRateLimiterService {
  return apiRateLimiter;
}

export async function checkRateLimit(config: AxiosRequestConfig): Promise<boolean> {
  return apiRateLimiter.checkRateLimit(config);
}

export function getRateLimitStats(): RateLimitStats {
  return apiRateLimiter.getStats();
}

export function resetRateLimitStats(): void {
  apiRateLimiter.resetStats();
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default apiRateLimiter;
