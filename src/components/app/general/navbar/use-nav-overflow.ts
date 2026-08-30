"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseNavOverflowOptions {
  itemCount: number;
  moreButtonWidth?: number;
}

interface UseNavOverflowResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  measureRef: React.RefObject<HTMLDivElement | null>;
  visibleCount: number;
}

export function useNavOverflow({
  itemCount,
  moreButtonWidth = 88,
}: UseNavOverflowOptions): UseNavOverflowResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const containerWidth = container.offsetWidth;
    const children = Array.from(measure.children) as HTMLElement[];

    if (children.length === 0) {
      setVisibleCount(itemCount);
      return;
    }

    let usedWidth = 0;
    let fitCount = 0;

    for (let i = 0; i < children.length; i++) {
      const width = children[i].offsetWidth;
      const remaining = children.length - (i + 1);
      const budget = containerWidth - (remaining > 0 ? moreButtonWidth : 0);

      if (usedWidth + width <= budget) {
        usedWidth += width;
        fitCount += 1;
      } else {
        break;
      }
    }

    setVisibleCount(Math.max(fitCount, 0));
  }, [itemCount, moreButtonWidth]);

  useEffect(() => {
    recalculate();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => recalculate());
    observer.observe(container);
    window.addEventListener("resize", recalculate);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recalculate);
    };
  }, [recalculate]);

  return { containerRef, measureRef, visibleCount };
}
