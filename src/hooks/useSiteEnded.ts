import { useState, useEffect } from 'react';

/**
 * Hook to track whether the site has ended (archive mode).
 * Reads from document.documentElement.dataset.siteEnded which is set by
 * the inline script in Layout.astro based on the _site_ended cookie.
 */
export function useSiteEnded(): boolean {
  const [ended, setEnded] = useState(
    () => document.documentElement.dataset.siteEnded === 'true'
  );

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      const v = el.dataset.siteEnded === 'true';
      setEnded(v);
    });
    observer.observe(el, { attributes: true, attributeFilter: ['data-site-ended'] });
    return () => observer.disconnect();
  }, []);

  return ended;
}
