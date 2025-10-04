import { useMemo, useState } from 'react';

interface UseVirtualizationProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizationResult {
  startIndex: number;
  endIndex: number;
  visibleItems: number[];
  totalHeight: number;
  offsetY: number;
}

/**
 * Virtualization hook for rendering large lists efficiently
 * Only renders visible items + overscan buffer
 */
export function useVirtualization({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualizationProps): VirtualizationResult {
  const [scrollTop, setScrollTop] = useState(0);

  const result = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      itemCount - 1,
      startIndex + visibleCount + overscan * 2
    );

    const visibleItems = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, i) => startIndex + i
    );

    return {
      startIndex,
      endIndex,
      visibleItems,
      totalHeight: itemCount * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [itemCount, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    ...result,
    handleScroll,
  } as VirtualizationResult & {
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
}
