/**
 * Performance Monitoring and Optimization Utilities
 * Tools for monitoring and optimizing application performance
 */

export interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export interface BundleAnalysis {
  totalSize: number;
  chunkSizes: Record<string, number>;
  unusedExports: string[];
  duplicateModules: string[];
}

/**
 * Performance monitoring utility (for use in React components)
 */
export const createPerformanceMonitor = (componentName: string) => {
  let renderStartTime = 0;
  let renderCount = 0;

  const startRender = () => {
    renderStartTime = performance.now();
    renderCount += 1;
  };

  const endRender = () => {
    const renderTime = performance.now() - renderStartTime;
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} render #${renderCount}: ${renderTime.toFixed(2)}ms`);
    }

    // Send metrics to monitoring service in production
    if (process.env.NODE_ENV === 'production' && renderTime > 16) { // > 1 frame at 60fps
      // Example: sendToMonitoringService({ componentName, renderTime, timestamp: Date.now() });
    }

    return renderTime;
  };

  return {
    startRender,
    endRender,
    renderCount: () => renderCount,
  };
};

/**
 * Debounce utility for performance optimization
 */
export const createDebounce = <T>(delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (value: T, callback: (value: T) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      callback(value);
    }, delay);
  };
};

/**
 * Throttle utility for performance optimization
 */
export const createThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  let lastRun = 0;

  return ((...args: any[]) => {
    if (Date.now() - lastRun >= delay) {
      callback(...args);
      lastRun = Date.now();
    }
  }) as T;
};

// Removed unused function

/**
 * Virtual scrolling utility for large lists
 */
export const createVirtualScrolling = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const getVisibleRange = (scrollTop: number) => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(itemCount - 1, end + overscan),
    };
  };

  const getTotalHeight = () => itemCount * itemHeight;

  const getOffsetY = (index: number) => index * itemHeight;

  return {
    getVisibleRange,
    getTotalHeight,
    getOffsetY,
  };
};

/**
 * Image lazy loading utility
 */
export const createLazyImageLoader = () => {
  const imageCache = new Map<string, HTMLImageElement>();

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (imageCache.has(src)) {
        resolve(imageCache.get(src)!);
        return;
      }

      const img = new Image();
      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = (srcs: string[]): Promise<HTMLImageElement[]> => {
    return Promise.all(srcs.map(loadImage));
  };

  return {
    loadImage,
    preloadImages,
    clearCache: () => imageCache.clear(),
  };
};

/**
 * Bundle size analyzer
 */
export const analyzeBundleSize = (bundle: any): BundleAnalysis => {
  const totalSize = Object.values(bundle).reduce((sum: number, chunk: any) => {
    return sum + (chunk.size || 0);
  }, 0);

  const chunkSizes = Object.entries(bundle).reduce((acc, [name, chunk]: [string, any]) => {
    acc[name] = chunk.size || 0;
    return acc;
  }, {} as Record<string, number>);

  // This would be implemented with actual bundle analysis tools
  const unusedExports: string[] = [];
  const duplicateModules: string[] = [];

  return {
    totalSize,
    chunkSizes,
    unusedExports,
    duplicateModules,
  };
};

/**
 * Memory usage monitor
 */
export const createMemoryMonitor = () => {
  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  };

  const isMemoryPressure = (threshold: number = 80) => {
    const usage = getMemoryUsage();
    return usage ? usage.percentage > threshold : false;
  };

  return {
    getMemoryUsage,
    isMemoryPressure,
  };
};

/**
 * Performance observer for long tasks
 */
export const createLongTaskObserver = (callback: (entries: PerformanceEntry[]) => void) => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  }

  return () => {};
};

/**
 * Resource timing analyzer
 */
export const analyzeResourceTiming = () => {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return resources.map(resource => ({
    name: resource.name,
    duration: resource.duration,
    size: resource.transferSize,
    type: resource.initiatorType,
    startTime: resource.startTime,
    connectTime: resource.connectEnd - resource.connectStart,
    dnsTime: resource.domainLookupEnd - resource.domainLookupStart,
    requestTime: resource.responseEnd - resource.requestStart,
  }));
};