/**
 * Mobile-First Responsive ResizeObserver Hook
 * Accurately measures element width/height in device pixels for Canvas engines
 */

import { useState, useEffect } from 'react';

export function useResizeObserver(elementRef) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 380,
    height: 560
  });

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w > 0 && h > 0) {
        setDimensions((prev) => {
          if (prev.width === w && prev.height === h) return prev;
          return { width: w, height: h };
        });
      }
    };

    // Initial measurement
    measure();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        if (!entries || !entries[0]) return;
        const entry = entries[0];
        let w = 0;
        let h = 0;
        if (entry.contentRect) {
          w = Math.floor(entry.contentRect.width);
          h = Math.floor(entry.contentRect.height);
        } else {
          const rect = el.getBoundingClientRect();
          w = Math.floor(rect.width);
          h = Math.floor(rect.height);
        }
        if (w > 0 && h > 0) {
          setDimensions((prev) => {
            if (prev.width === w && prev.height === h) return prev;
            return { width: w, height: h };
          });
        }
      });
      ro.observe(el);
    } else {
      window.addEventListener('resize', measure);
      window.addEventListener('orientationchange', measure);
    }

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, [elementRef]);

  return dimensions;
}

export default useResizeObserver;
