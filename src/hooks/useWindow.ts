import { useState, useEffect } from 'react';

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
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--px', x.toString());
      document.documentElement.style.setProperty('--py', y.toString());
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
}

/**
 * Hook to track scroll progress
 * @returns Current scroll progress as percentage (0-1)
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

/**
 * Hook for scroll-based section visibility tracking
 * @param elementRef - Ref to element to track
 * @returns Progress value (0-1) of element visibility
 */
export function useScrollVisibility(elementRef: React.RefObject<HTMLElement>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;
      const rect = elementRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, 1 - (rect.top + rect.height / 2) / (vh + rect.height / 2)));
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [elementRef]);

  return progress;
}
