// Performance optimization utilities

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

// Memoize function
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Lazy load image
export function lazyLoadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

// Preload images
export function preloadImages(urls: string[]): Promise<string[]> {
  return Promise.all(urls.map(lazyLoadImage));
}

// Request idle callback wrapper
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, options);
  } else {
    setTimeout(callback, 1);
  }
}

// Measure component render time
export function measureRenderTime(componentName: string) {
  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;
  const measureName = `${componentName}-render`;

  return {
    start: () => {
      if (typeof window !== 'undefined' && window.performance) {
        window.performance.mark(startMark);
      }
    },
    end: () => {
      if (typeof window !== 'undefined' && window.performance) {
        window.performance.mark(endMark);
        try {
          window.performance.measure(measureName, startMark, endMark);
          const measure = window.performance.getEntriesByName(measureName)[0];
          if (measure && process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${componentName} rendered in ${measure.duration.toFixed(2)}ms`);
          }
        } catch (error) {
          // Marks might not exist
        }
      }
    },
  };
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals] LCP:', lastEntry.renderTime || lastEntry.loadTime);
      }

      // Send to analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          event_category: 'Web Vitals',
        });
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Web Vitals] FID:', entry.processingStart - entry.startTime);
        }

        if ((window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            event_category: 'Web Vitals',
          });
        }
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals] CLS:', clsValue);
      }
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Not supported
    }
  }
}

// Batch updates for better performance
export function batchUpdates<T>(
  updates: T[],
  batchSize: number,
  callback: (batch: T[]) => void | Promise<void>
): Promise<void> {
  return new Promise(async (resolve) => {
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      await callback(batch);
      
      // Allow browser to breathe
      await new Promise(r => setTimeout(r, 0));
    }
    resolve();
  });
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  // Check device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) {
    return true;
  }

  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }

  return false;
}

// Adaptive quality based on device
export function getQualitySettings() {
  const isLowEnd = isLowEndDevice();

  return {
    animations: !isLowEnd,
    particleEffects: !isLowEnd,
    shadowQuality: isLowEnd ? 'low' : 'high',
    imageQuality: isLowEnd ? 'medium' : 'high',
    maxFPS: isLowEnd ? 30 : 60,
  };
}

// Cache with expiration
export class CacheWithExpiry<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  set(key: string, value: T, ttl: number = 5 * 60 * 1000) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

// Image cache
export const imageCache = new CacheWithExpiry<string>();

// API response cache
export const apiCache = new CacheWithExpiry<any>();
