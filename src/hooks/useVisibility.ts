import { useState, useEffect } from 'react';
import { rafThrottle } from '../utils/performance';

export function useVisibility(ref: React.RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(element);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return isVisible;
}

export function useScrollTracking(
  ref: React.RefObject<HTMLElement | null>,
  isVisible: boolean,
  calc: (rect: DOMRect, vh: number) => number,
) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = rafThrottle(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      setProgress(Math.max(0, Math.min(1, calc(rect, vh))));
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);
  return progress;
}
