/**
 * Performance-optimized utilities for high-traffic scenarios
 * Prevents lag when serving 1000+ concurrent users
 */

/**
 * Request animation frame throttle - better for scroll/resize
 * Limits updates to 60fps or less
 */
export function rafThrottle<T extends (...args: never[]) => unknown>(
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
