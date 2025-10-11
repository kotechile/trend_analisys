/**
 * API Cache Service for the Trend Analysis Platform.
 * 
 * This service provides caching functionality for API responses,
 * offline support, and cache management.
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig } from './apiConfig';

// =============================================================================
// CACHE TYPES
// =============================================================================

export interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
  etag?: string;
  lastModified?: string;
  size: number;
  key: string;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enableOfflineMode: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
  storageType: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  lastCleanup: number;
}

// =============================================================================
// API CACHE SERVICE
// =============================================================================

export class ApiCacheService {
  private cache: Map<string, CacheEntry>;
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      enableOfflineMode: true,
      enableCompression: false,
      enableEncryption: false,
      storageType: 'memory',
      ...config
    };
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      lastCleanup: Date.now()
    };

    this.startCleanupInterval();
  }

  // =============================================================================
  // CACHE OPERATIONS
  // =============================================================================

  set(key: string, data: any, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);
    const size = this.calculateSize(data);
    
    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt,
      size,
      key
    };

    // Check if we need to evict entries
    if (this.config.maxSize > 0 && this.stats.totalSize + size > this.config.maxSize) {
      this.evictEntries(size);
    }

    this.cache.set(key, entry);
    this.updateStats();
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.missRate++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.missRate++;
      this.updateStats();
      return null;
    }

    this.stats.hitRate++;
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? Date.now() <= entry.expiresAt : false;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.stats.totalSize -= entry.size;
      this.stats.totalEntries--;
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      lastCleanup: Date.now()
    };
  }

  // =============================================================================
  // CACHE KEY GENERATION
  // =============================================================================

  generateKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    
    // Create a hash of the request parameters
    const keyData = {
      method: method?.toUpperCase(),
      url,
      params: params || {},
      data: data || {}
    };
    
    return this.hashObject(keyData);
  }

  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    return this.simpleHash(str);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // =============================================================================
  // CACHE VALIDATION
  // =============================================================================

  isValid(entry: CacheEntry): boolean {
    return Date.now() <= entry.expiresAt;
  }

  isStale(entry: CacheEntry, maxAge?: number): boolean {
    const age = Date.now() - entry.timestamp;
    return age > (maxAge || this.config.defaultTTL);
  }

  // =============================================================================
  // CACHE EVICTION
  // =============================================================================

  private evictEntries(requiredSize: number): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    let freedSize = 0;
    let evictedCount = 0;
    
    for (const [key, entry] of entries) {
      if (freedSize >= requiredSize) break;
      
      this.cache.delete(key);
      freedSize += entry.size;
      evictedCount++;
      this.stats.evictionCount++;
    }
    
    this.stats.totalSize -= freedSize;
    this.stats.totalEntries -= evictedCount;
  }

  evictExpired(): void {
    const now = Date.now();
    let evictedCount = 0;
    let freedSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        evictedCount++;
        freedSize += entry.size;
      }
    }
    
    this.stats.totalSize -= freedSize;
    this.stats.totalEntries -= evictedCount;
  }

  evictByPattern(pattern: RegExp): void {
    let evictedCount = 0;
    let freedSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        evictedCount++;
        freedSize += entry.size;
      }
    }
    
    this.stats.totalSize -= freedSize;
    this.stats.totalEntries -= evictedCount;
  }

  // =============================================================================
  // CACHE STATISTICS
  // =============================================================================

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    const totalRequests = this.stats.hitRate + this.stats.missRate;
    if (totalRequests > 0) {
      this.stats.hitRate = this.stats.hitRate / totalRequests;
      this.stats.missRate = this.stats.missRate / totalRequests;
    }
  }

  // =============================================================================
  // CACHE CONFIGURATION
  // =============================================================================

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setMaxSize(maxSize: number): void {
    this.config.maxSize = maxSize;
  }

  setDefaultTTL(ttl: number): void {
    this.config.defaultTTL = ttl;
  }

  setOfflineMode(enabled: boolean): void {
    this.config.enableOfflineMode = enabled;
  }

  // =============================================================================
  // CACHE CLEANUP
  // =============================================================================

  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.evictExpired();
      this.stats.lastCleanup = Date.now();
    }, 60000); // Cleanup every minute
  }

  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // =============================================================================
  // CACHE PERSISTENCE
  // =============================================================================

  async saveToStorage(): Promise<void> {
    if (this.config.storageType === 'memory') return;
    
    try {
      const data = Array.from(this.cache.entries());
      const serialized = JSON.stringify(data);
      
      if (this.config.storageType === 'localStorage') {
        localStorage.setItem('api_cache', serialized);
      } else if (this.config.storageType === 'sessionStorage') {
        sessionStorage.setItem('api_cache', serialized);
      }
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  async loadFromStorage(): Promise<void> {
    if (this.config.storageType === 'memory') return;
    
    try {
      let serialized: string | null = null;
      
      if (this.config.storageType === 'localStorage') {
        serialized = localStorage.getItem('api_cache');
      } else if (this.config.storageType === 'sessionStorage') {
        serialized = sessionStorage.getItem('api_cache');
      }
      
      if (serialized) {
        const data = JSON.parse(serialized);
        this.cache = new Map(data);
        this.updateStats();
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }

  // =============================================================================
  // CACHE COMPRESSION
  // =============================================================================

  private compress(data: any): string {
    if (!this.config.enableCompression) {
      return JSON.stringify(data);
    }
    
    // Simple compression - in a real implementation, you'd use a compression library
    return JSON.stringify(data);
  }

  private decompress(compressed: string): any {
    if (!this.config.enableCompression) {
      return JSON.parse(compressed);
    }
    
    // Simple decompression - in a real implementation, you'd use a compression library
    return JSON.parse(compressed);
  }

  // =============================================================================
  // CACHE ENCRYPTION
  // =============================================================================

  private encrypt(data: string): string {
    if (!this.config.enableEncryption) {
      return data;
    }
    
    // Simple encryption - in a real implementation, you'd use a proper encryption library
    return btoa(data);
  }

  private decrypt(encrypted: string): string {
    if (!this.config.enableEncryption) {
      return encrypted;
    }
    
    // Simple decryption - in a real implementation, you'd use a proper encryption library
    return atob(encrypted);
  }

  // =============================================================================
  // CACHE SIZE CALCULATION
  // =============================================================================

  private calculateSize(data: any): number {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }

  // =============================================================================
  // CACHE DESTRUCTION
  // =============================================================================

  destroy(): void {
    this.stopCleanupInterval();
    this.clear();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const apiCache = new ApiCacheService({
  maxSize: 50 * 1024 * 1024, // 50MB
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  enableOfflineMode: true,
  enableCompression: false,
  enableEncryption: false,
  storageType: 'memory'
});

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function getApiCache(): ApiCacheService {
  return apiCache;
}

export function setCacheEntry(key: string, data: any, ttl?: number): void {
  apiCache.set(key, data, ttl);
}

export function getCacheEntry(key: string): any | null {
  return apiCache.get(key);
}

export function hasCacheEntry(key: string): boolean {
  return apiCache.has(key);
}

export function deleteCacheEntry(key: string): boolean {
  return apiCache.delete(key);
}

export function clearCache(): void {
  apiCache.clear();
}

export function getCacheStats(): CacheStats {
  return apiCache.getStats();
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default apiCache;
