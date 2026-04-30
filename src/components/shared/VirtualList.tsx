import { useRef, useEffect, useState, useMemo, useCallback } from 'react';

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
  bufferSize?: number;
  className?: string;
  style?: React.CSSProperties;
  overscan?: number;
}

/**
 * Virtualized list component - renders only visible items
 * Critical for performance with 1000+ items
 *
 * @example
 * <VirtualList
 *   items={classCards}
 *   itemHeight={320}
 *   containerHeight={600}
 *   renderItem={(item, i) => <ClassCard item={item} index={i} />}
 * />
 */
export const VirtualList = <T extends any>({
  items,
  itemHeight,
  renderItem,
  containerHeight,
  bufferSize = 5,
  className,
  style,
}: VirtualListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  let scrollTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const scrollBuffer = bufferSize * itemHeight;
    const startIndex = Math.max(
      0,
      Math.floor((scrollTop - scrollBuffer) / itemHeight)
    );
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight + scrollBuffer) / itemHeight)
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, bufferSize, items.length]);

  // Visible items
  const visibleItems = useMemo(
    () =>
      items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, i) => ({
        item,
        index: visibleRange.startIndex + i,
        offset: (visibleRange.startIndex + i) * itemHeight,
      })),
    [items, visibleRange, itemHeight]
  );

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      setScrollTop(element.scrollTop);

      if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
      }

      scrollTimeoutId = setTimeout(() => {
        // Scroll end logic can go here if needed
      }, 150);
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        ...style,
      }}
      onScroll={handleScroll}
    >
      {/* Spacer before visible items */}
      <div style={{ height: visibleRange.startIndex * itemHeight }} />

      {/* Visible items */}
      {visibleItems.map(({ item, index }) => (
        <div key={index} style={{ minHeight: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* Spacer after visible items */}
      <div
        style={{
          height: (items.length - visibleRange.endIndex) * itemHeight,
        }}
      />
    </div>
  );
};

/**
 * Dynamic virtual list that auto-adjusts to container height
 */
export const DynamicVirtualList = <T extends any>(
  props: Omit<VirtualListProps<T>, 'containerHeight'>
) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    if (!parentRef.current) return;

    const observer = new ResizeObserver(() => {
      setHeight(parentRef.current?.clientHeight || 600);
    });

    observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={parentRef} style={{ width: '100%', height: '100%' }}>
      <VirtualList {...props} containerHeight={height} />
    </div>
  );
};
