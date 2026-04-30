import { useState, useEffect, useCallback, lazy as ReactLazy, createElement, type ComponentType, type LazyExoticComponent } from 'react';
import { rafThrottle, throttle, debounce } from '../utils/performance';

/**
 * Optimized scroll progress hook with RAF throttling
 * Only updates 60fps or less
 */
export function useOptimizedScrollProgress(): number {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const updateProgress = rafThrottle(() => {
      const el = document.documentElement;
      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setPct(progress);
    });

    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return pct;
}

/**
 * Optimized parallax mouse with throttling
 * Only updates every 16ms (60fps)
 */
export function useOptimizedParallaxMouse(): void {
  useEffect(() => {
    const onMove = throttle((e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--px', x.toString());
      document.documentElement.style.setProperty('--py', y.toString());
    }, 16); // 60fps

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
}

/**
 * Optimized scroll visibility with lazy evaluation
 * Only calculates when element might become visible
 */
export function useOptimizedScrollVisibility(
  elementRef: React.RefObject<HTMLElement>,
  options = { threshold: 0.1 }
): number {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Use IntersectionObserver to only track when visible
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options]);

  // Only calculate progress when visible
  useEffect(() => {
    if (!isVisible) return;

    const updateProgress = rafThrottle(() => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const newProgress = Math.max(
        0,
        Math.min(1, 1 - rect.top / viewportHeight)
      );

      setProgress(newProgress);
    });

    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, [isVisible, elementRef]);

  return progress;
}

/**
 * Lazy load image with blur-up effect
 * Returns object with loading state
 */
export function useLazyImage(src: string): {
  loaded: boolean;
  error: boolean;
} {
  const [loaded, setLoaded] = useState(false);
  const [errorState, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoaded(false);
      setError(false);
      return;
    }

    const img = new Image();

    img.onload = () => {
      setLoaded(true);
      setError(false);
    };

    img.onerror = () => {
      setLoaded(false);
      setError(true);
    };

    img.src = src;
  }, [src]);

  return {
    loaded,
    error: errorState,
  };
}

/**
 * Window resize hook with debouncing
 * Only updates after resize ends (300ms idle)
 */
export function useDebouncedWindowSize(): {
  width: number;
  height: number;
} {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 300);

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Debounce a callback
 */
export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
        setTimeoutId(null);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  );
}

/**
 * Lazy import for code splitting
 * Use with React.lazy for better performance
 */
export function lazyLoadComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
): LazyExoticComponent<ComponentType<P>> {
  const FallbackComponent: ComponentType<P> = () => {
    return createElement('div', null, 'Failed to load component');
  };

  return ReactLazy(() =>
    importFunc().catch((err: unknown) => {
      if (err instanceof Error) {
        console.error('Failed to load component:', err.message);
      }
      return {
        default: FallbackComponent,
      };
    })
  );
}

// Re-export performance utilities
export { debounce, throttle, rafThrottle } from '../utils/performance';
