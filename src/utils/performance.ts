/**
 * Performance-optimized utilities for high-traffic scenarios
 * Prevents lag when serving 1000+ concurrent users
 */

/**
 * Debounce function - reduces event handler calls
 * @param func Function to debounce
 * @param wait Milliseconds to wait
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits event handler calls
 * @param func Function to throttle
 * @param limit Milliseconds between calls
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request animation frame throttle - better for scroll/resize
 * Limits updates to 60fps or less
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let frameId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    lastArgs = args;

    if (frameId) {
      return;
    }

    frameId = requestAnimationFrame(() => {
      func(...lastArgs!);
      frameId = null;
    });
  };
}

/**
 * Request idle callback wrapper with fallback
 * Executes non-critical work when browser is idle
 */
export function scheduleIdleTask(callback: () => void): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 100);
  }
}

/**
 * IntersectionObserver helper for lazy loading
 * @param element Element to observe
 * @param callback Called when element becomes visible
 * @param options IntersectionObserver options
 */
export function observeIntersection(
  element: Element,
  callback: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
): () => void {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      callback();
      observer.unobserve(element);
    }
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
}

/**
 * Get from localStorage with TTL
 */
export function getFromCache(key: string): any | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const data = JSON.parse(item);
    if (data.expiry && Date.now() > data.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return data.value;
  } catch {
    return null;
  }
}

/**
 * Save to localStorage with TTL (milliseconds)
 */
export function saveToCache(key: string, value: any, ttl: number = 3600000): void {
  try {
    const data = {
      value,
      expiry: ttl ? Date.now() + ttl : null,
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Prefetch resource hints
 */
export function prefetchResource(url: string, as: 'script' | 'style' | 'image' = 'script'): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preconnect to external domain
 */
export function preconnect(url: string): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
}
