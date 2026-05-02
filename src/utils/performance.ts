/**
 * Performance Utilities for LISH Platform
 * Optimizations for loading, caching, and user experience
 */

// Image optimization helper
export const optimizeImageUrl = (url: string, width?: number): string => {
  if (!url) return url;
  
  // If it's a Supabase storage URL, add transformation parameters
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    params.append('quality', '85');
    params.append('format', 'webp');
    return `${url}?${params.toString()}`;
  }
  
  return url;
};

// Debounce function for search and input fields
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Lazy load images with Intersection Observer
export const lazyLoadImage = (img: HTMLImageElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        const src = target.dataset.src;
        if (src) {
          target.src = src;
          target.removeAttribute('data-src');
        }
        observer.unobserve(target);
      }
    });
  });
  
  observer.observe(img);
};

// Preload critical resources
export const preloadResource = (url: string, type: 'image' | 'script' | 'style') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
};

// Cache management for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
};

export const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
};

// Network status detection
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const onNetworkChange = (callback: (online: boolean) => void) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
  
  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
};
