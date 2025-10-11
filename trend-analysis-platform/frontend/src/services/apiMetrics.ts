/**
 * API Metrics Service for the Trend Analysis Platform.
 * 
 * This service provides metrics collection and monitoring for API requests,
 * performance tracking, and analytics.
 */

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { apiConfig } from './apiConfig';

// =============================================================================
// METRICS TYPES
// =============================================================================

export interface RequestMetrics {
  requestId: string;
  method: string;
  url: string;
  baseURL: string;
  timestamp: number;
  duration: number;
  statusCode: number;
  statusText: string;
  responseSize: number;
  requestSize: number;
  userAgent: string;
  ipAddress?: string;
  userId?: string;
  sessionId?: string;
  error?: string;
  retryCount: number;
  cacheHit: boolean;
  fromCache: boolean;
  offline: boolean;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  throughput: number;
  cacheHitRate: number;
  offlineRate: number;
}

export interface EndpointMetrics {
  endpoint: string;
  method: string;
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequestTime: number;
  successRate: number;
}

export interface UserMetrics {
  userId: string;
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  lastActivity: number;
  favoriteEndpoints: string[];
  usagePattern: 'light' | 'moderate' | 'heavy';
}

export interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  connectionCount: number;
  activeUsers: number;
  systemLoad: number;
}

// =============================================================================
// API METRICS SERVICE
// =============================================================================

export class ApiMetricsService {
  private metrics: RequestMetrics[];
  private performanceMetrics: PerformanceMetrics;
  private endpointMetrics: Map<string, EndpointMetrics>;
  private userMetrics: Map<string, UserMetrics>;
  private systemMetrics: SystemMetrics;
  private isEnabled: boolean;
  private maxMetricsHistory: number;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.metrics = [];
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.endpointMetrics = new Map();
    this.userMetrics = new Map();
    this.systemMetrics = this.initializeSystemMetrics();
    this.isEnabled = apiConfig.isMetricsEnabled();
    this.maxMetricsHistory = 1000; // Keep last 1000 requests
    
    this.startFlushInterval();
  }

  // =============================================================================
  // METRICS COLLECTION
  // =============================================================================

  recordRequest(config: AxiosRequestConfig, startTime: number): string {
    if (!this.isEnabled) return '';
    
    const requestId = this.generateRequestId();
    const timestamp = Date.now();
    
    const requestMetric: RequestMetrics = {
      requestId,
      method: config.method?.toUpperCase() || 'GET',
      url: config.url || '',
      baseURL: config.baseURL || '',
      timestamp,
      duration: 0, // Will be updated when response is received
      statusCode: 0,
      statusText: '',
      responseSize: 0,
      requestSize: this.calculateRequestSize(config),
      userAgent: navigator.userAgent,
      ipAddress: this.getClientIP(),
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      retryCount: 0,
      cacheHit: false,
      fromCache: false,
      offline: !navigator.onLine
    };
    
    this.metrics.push(requestMetric);
    this.trimMetricsHistory();
    
    return requestId;
  }

  recordResponse(requestId: string, response: AxiosResponse): void {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.find(m => m.requestId === requestId);
    if (!metric) return;
    
    const endTime = Date.now();
    metric.duration = endTime - metric.timestamp;
    metric.statusCode = response.status;
    metric.statusText = response.statusText;
    metric.responseSize = this.calculateResponseSize(response);
    
    this.updatePerformanceMetrics(metric);
    this.updateEndpointMetrics(metric);
    this.updateUserMetrics(metric);
  }

  recordError(requestId: string, error: AxiosError): void {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.find(m => m.requestId === requestId);
    if (!metric) return;
    
    const endTime = Date.now();
    metric.duration = endTime - metric.timestamp;
    metric.statusCode = error.response?.status || 0;
    metric.statusText = error.response?.statusText || 'Network Error';
    metric.error = error.message;
    
    this.updatePerformanceMetrics(metric);
    this.updateEndpointMetrics(metric);
    this.updateUserMetrics(metric);
  }

  recordRetry(requestId: string): void {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.find(m => m.requestId === requestId);
    if (metric) {
      metric.retryCount++;
    }
  }

  recordCacheHit(requestId: string): void {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.find(m => m.requestId === requestId);
    if (metric) {
      metric.cacheHit = true;
      metric.fromCache = true;
    }
  }

  // =============================================================================
  // PERFORMANCE METRICS
  // =============================================================================

  private updatePerformanceMetrics(metric: RequestMetrics): void {
    this.performanceMetrics.totalRequests++;
    
    if (metric.statusCode >= 200 && metric.statusCode < 400) {
      this.performanceMetrics.successfulRequests++;
    } else {
      this.performanceMetrics.failedRequests++;
    }
    
    // Update response time metrics
    this.updateResponseTimeMetrics(metric.duration);
    
    // Update error rate
    this.performanceMetrics.errorRate = 
      this.performanceMetrics.failedRequests / this.performanceMetrics.totalRequests;
    
    // Update throughput (requests per minute)
    this.updateThroughput();
    
    // Update cache hit rate
    this.updateCacheHitRate();
    
    // Update offline rate
    this.updateOfflineRate();
  }

  private updateResponseTimeMetrics(duration: number): void {
    const responseTimes = this.metrics
      .filter(m => m.duration > 0)
      .map(m => m.duration);
    
    if (responseTimes.length === 0) return;
    
    // Sort response times
    responseTimes.sort((a, b) => a - b);
    
    // Calculate percentiles
    const count = responseTimes.length;
    this.performanceMetrics.averageResponseTime = 
      responseTimes.reduce((sum, time) => sum + time, 0) / count;
    
    this.performanceMetrics.medianResponseTime = responseTimes[Math.floor(count / 2)];
    this.performanceMetrics.p95ResponseTime = responseTimes[Math.floor(count * 0.95)];
    this.performanceMetrics.p99ResponseTime = responseTimes[Math.floor(count * 0.99)];
    this.performanceMetrics.minResponseTime = Math.min(...responseTimes);
    this.performanceMetrics.maxResponseTime = Math.max(...responseTimes);
  }

  private updateThroughput(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentRequests = this.metrics.filter(m => m.timestamp >= oneMinuteAgo);
    this.performanceMetrics.throughput = recentRequests.length;
  }

  private updateCacheHitRate(): void {
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    this.performanceMetrics.cacheHitRate = 
      this.performanceMetrics.totalRequests > 0 
        ? cacheHits / this.performanceMetrics.totalRequests 
        : 0;
  }

  private updateOfflineRate(): void {
    const offlineRequests = this.metrics.filter(m => m.offline).length;
    this.performanceMetrics.offlineRate = 
      this.performanceMetrics.totalRequests > 0 
        ? offlineRequests / this.performanceMetrics.totalRequests 
        : 0;
  }

  // =============================================================================
  // ENDPOINT METRICS
  // =============================================================================

  private updateEndpointMetrics(metric: RequestMetrics): void {
    const endpoint = this.normalizeEndpoint(metric.url);
    const key = `${metric.method}:${endpoint}`;
    
    let endpointMetric = this.endpointMetrics.get(key);
    if (!endpointMetric) {
      endpointMetric = {
        endpoint,
        method: metric.method,
        requestCount: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastRequestTime: 0,
        successRate: 0
      };
      this.endpointMetrics.set(key, endpointMetric);
    }
    
    endpointMetric.requestCount++;
    endpointMetric.lastRequestTime = metric.timestamp;
    
    // Update average response time
    const endpointRequests = this.metrics.filter(m => 
      this.normalizeEndpoint(m.url) === endpoint && m.method === metric.method
    );
    
    if (endpointRequests.length > 0) {
      endpointMetric.averageResponseTime = 
        endpointRequests.reduce((sum, m) => sum + m.duration, 0) / endpointRequests.length;
    }
    
    // Update error rate
    const failedRequests = endpointRequests.filter(m => m.statusCode >= 400).length;
    endpointMetric.errorRate = failedRequests / endpointRequests.length;
    endpointMetric.successRate = 1 - endpointMetric.errorRate;
  }

  private normalizeEndpoint(url: string): string {
    // Remove query parameters and normalize path segments
    const path = url.split('?')[0];
    return path.replace(/\d+/g, ':id').replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, ':uuid');
  }

  // =============================================================================
  // USER METRICS
  // =============================================================================

  private updateUserMetrics(metric: RequestMetrics): void {
    if (!metric.userId) return;
    
    let userMetric = this.userMetrics.get(metric.userId);
    if (!userMetric) {
      userMetric = {
        userId: metric.userId,
        requestCount: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastActivity: 0,
        favoriteEndpoints: [],
        usagePattern: 'light'
      };
      this.userMetrics.set(metric.userId, userMetric);
    }
    
    userMetric.requestCount++;
    userMetric.lastActivity = metric.timestamp;
    
    // Update average response time
    const userRequests = this.metrics.filter(m => m.userId === metric.userId);
    if (userRequests.length > 0) {
      userMetric.averageResponseTime = 
        userRequests.reduce((sum, m) => sum + m.duration, 0) / userRequests.length;
    }
    
    // Update error rate
    const failedRequests = userRequests.filter(m => m.statusCode >= 400).length;
    userMetric.errorRate = failedRequests / userRequests.length;
    
    // Update favorite endpoints
    this.updateFavoriteEndpoints(userMetric);
    
    // Update usage pattern
    this.updateUsagePattern(userMetric);
  }

  private updateFavoriteEndpoints(userMetric: UserMetrics): void {
    const userRequests = this.metrics.filter(m => m.userId === userMetric.userId);
    const endpointCounts = new Map<string, number>();
    
    userRequests.forEach(m => {
      const endpoint = this.normalizeEndpoint(m.url);
      const count = endpointCounts.get(endpoint) || 0;
      endpointCounts.set(endpoint, count + 1);
    });
    
    userMetric.favoriteEndpoints = Array.from(endpointCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([endpoint]) => endpoint);
  }

  private updateUsagePattern(userMetric: UserMetrics): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const recentRequests = this.metrics.filter(m => 
      m.userId === userMetric.userId && m.timestamp >= oneHourAgo
    ).length;
    
    if (recentRequests < 10) {
      userMetric.usagePattern = 'light';
    } else if (recentRequests < 50) {
      userMetric.usagePattern = 'moderate';
    } else {
      userMetric.usagePattern = 'heavy';
    }
  }

  // =============================================================================
  // SYSTEM METRICS
  // =============================================================================

  private updateSystemMetrics(): void {
    if (!this.isEnabled) return;
    
    // Memory usage (approximate)
    if ('memory' in performance) {
      this.systemMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
    
    // Network latency (approximate)
    this.systemMetrics.networkLatency = this.calculateNetworkLatency();
    
    // Active users
    this.systemMetrics.activeUsers = this.userMetrics.size;
    
    // Connection count (approximate)
    this.systemMetrics.connectionCount = this.metrics.filter(m => 
      m.timestamp >= Date.now() - 300000 // Last 5 minutes
    ).length;
  }

  private calculateNetworkLatency(): number {
    const recentRequests = this.metrics.filter(m => 
      m.timestamp >= Date.now() - 60000 // Last minute
    );
    
    if (recentRequests.length === 0) return 0;
    
    const totalLatency = recentRequests.reduce((sum, m) => sum + m.duration, 0);
    return totalLatency / recentRequests.length;
  }

  // =============================================================================
  // METRICS GETTERS
  // =============================================================================

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  getEndpointMetrics(): EndpointMetrics[] {
    return Array.from(this.endpointMetrics.values());
  }

  getUserMetrics(): UserMetrics[] {
    return Array.from(this.userMetrics.values());
  }

  getSystemMetrics(): SystemMetrics {
    this.updateSystemMetrics();
    return { ...this.systemMetrics };
  }

  getRequestMetrics(limit?: number): RequestMetrics[] {
    const metrics = this.metrics.slice(-limit || this.maxMetricsHistory);
    return metrics.map(m => ({ ...m }));
  }

  // =============================================================================
  // METRICS FILTERING
  // =============================================================================

  getMetricsByEndpoint(endpoint: string): RequestMetrics[] {
    return this.metrics.filter(m => this.normalizeEndpoint(m.url) === endpoint);
  }

  getMetricsByUser(userId: string): RequestMetrics[] {
    return this.metrics.filter(m => m.userId === userId);
  }

  getMetricsByTimeRange(startTime: number, endTime: number): RequestMetrics[] {
    return this.metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  getMetricsByStatus(statusCode: number): RequestMetrics[] {
    return this.metrics.filter(m => m.statusCode === statusCode);
  }

  // =============================================================================
  // METRICS EXPORT
  // =============================================================================

  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    
    return JSON.stringify({
      performance: this.getPerformanceMetrics(),
      endpoints: this.getEndpointMetrics(),
      users: this.getUserMetrics(),
      system: this.getSystemMetrics(),
      requests: this.getRequestMetrics()
    }, null, 2);
  }

  private exportToCSV(): string {
    const headers = [
      'requestId', 'method', 'url', 'timestamp', 'duration', 'statusCode',
      'statusText', 'responseSize', 'requestSize', 'userId', 'sessionId',
      'retryCount', 'cacheHit', 'fromCache', 'offline', 'error'
    ];
    
    const rows = this.metrics.map(m => [
      m.requestId, m.method, m.url, m.timestamp, m.duration, m.statusCode,
      m.statusText, m.responseSize, m.requestSize, m.userId || '', m.sessionId || '',
      m.retryCount, m.cacheHit, m.fromCache, m.offline, m.error || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // =============================================================================
  // METRICS CLEANUP
  // =============================================================================

  private trimMetricsHistory(): void {
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.updateSystemMetrics();
    }, 30000); // Update every 30 seconds
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateRequestSize(config: AxiosRequestConfig): number {
    const data = config.data ? JSON.stringify(config.data) : '';
    return new Blob([data]).size;
  }

  private calculateResponseSize(response: AxiosResponse): number {
    const data = response.data ? JSON.stringify(response.data) : '';
    return new Blob([data]).size;
  }

  private getClientIP(): string {
    // This would be populated by the server in a real implementation
    return 'unknown';
  }

  private getCurrentUserId(): string | undefined {
    // This would get the current user ID from the auth service
    return undefined;
  }

  private getCurrentSessionId(): string | undefined {
    // This would get the current session ID from the auth service
    return undefined;
  }

  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      averageResponseTime: 0,
      medianResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errorRate: 0,
      throughput: 0,
      cacheHitRate: 0,
      offlineRate: 0
    };
  }

  private initializeSystemMetrics(): SystemMetrics {
    return {
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0,
      connectionCount: 0,
      activeUsers: 0,
      systemLoad: 0
    };
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setMaxMetricsHistory(max: number): void {
    this.maxMetricsHistory = max;
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    this.metrics = [];
    this.endpointMetrics.clear();
    this.userMetrics.clear();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const apiMetrics = new ApiMetricsService();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function getApiMetrics(): ApiMetricsService {
  return apiMetrics;
}

export function recordRequest(config: AxiosRequestConfig, startTime: number): string {
  return apiMetrics.recordRequest(config, startTime);
}

export function recordResponse(requestId: string, response: AxiosResponse): void {
  apiMetrics.recordResponse(requestId, response);
}

export function recordError(requestId: string, error: AxiosError): void {
  apiMetrics.recordError(requestId, error);
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return apiMetrics.getPerformanceMetrics();
}

export function getEndpointMetrics(): EndpointMetrics[] {
  return apiMetrics.getEndpointMetrics();
}

export function getUserMetrics(): UserMetrics[] {
  return apiMetrics.getUserMetrics();
}

export function getSystemMetrics(): SystemMetrics {
  return apiMetrics.getSystemMetrics();
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default apiMetrics;
