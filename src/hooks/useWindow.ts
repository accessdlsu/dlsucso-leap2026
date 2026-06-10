import { useState, useEffect } from 'react';
import { rafThrottle } from '../utils/performance';

/**
 * Hook to get current window width and update on resize
 * @param initialWidth - Default width when window is not available (SSR)
 * @returns Current window width
 */
export function useWindowWidth(initialWidth = 1280): number {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : initialWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

/**
 * Hook to track if window width is mobile size
 * @param breakpoint - Mobile breakpoint in pixels (default: 768px)
 * @returns True if window width is less than breakpoint
 */
export function useIsMobile(breakpoint = 768): boolean {
  const width = useWindowWidth();
  return width < breakpoint;
}

/**
 * Hook for parallax mouse movement effect
 * Updates CSS custom properties for parallax calculations
 */
export function useParallaxMouse(): void {
  useEffect(() => {
    const onMove = rafThrottle((e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--px', x.toString());
      document.documentElement.style.setProperty('--py', y.toString());
    });

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
}
