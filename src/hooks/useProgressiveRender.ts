import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Progressive rendering hook — renders items in batches as the user scrolls.
 *
 * Mount an IntersectionObserver on a sentinel element placed after the last
 * rendered item. When the sentinel enters the viewport, bump the visible count
 * by `batchSize`. Resets when the total item count changes (e.g. filters applied).
 *
 * @param totalCount  Total number of items after filtering.
 * @param initialCount  How many items to render on first paint (default 12).
 * @param batchSize  How many items to add per scroll trigger (default 12).
 */
export function useProgressiveRender(
  totalCount: number,
  initialCount = 12,
  batchSize = 12,
) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when the filtered list changes
  const prevTotal = useRef(totalCount);
  useEffect(() => {
    if (totalCount !== prevTotal.current) {
      prevTotal.current = totalCount;
      setVisibleCount(initialCount);
    }
  }, [totalCount, initialCount]);

  // Observe the sentinel
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, totalCount));
  }, [batchSize, totalCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (visibleCount >= totalCount) return; // nothing more to load

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '200px' }, // start loading a bit before the user reaches the bottom
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, totalCount, loadMore]);

  return { visibleCount, sentinelRef, hasMore: visibleCount < totalCount };
}
