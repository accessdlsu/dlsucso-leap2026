import { useState, useEffect } from 'react';
import { rafThrottle } from '../utils/performance';

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

export { rafThrottle } from '../utils/performance';
