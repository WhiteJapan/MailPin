import { useEffect, useRef, useState } from 'react';

const triggerDistance = 68;

export function usePullToRefresh(onRefresh: () => Promise<void>, disabled = false) {
  const containerRef = useRef<HTMLElement | null>(null);
  const start = useRef<{ x: number; y: number } | undefined>(undefined);
  const distanceRef = useRef(0);
  const [distance, setDistance] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const reset = () => {
      start.current = undefined;
      distanceRef.current = 0;
      setDistance(0);
      setPulling(false);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (disabled || refreshing || window.scrollY > 0 || event.touches.length !== 1) return;
      if ((event.target as HTMLElement).closest('button, a, input, select')) return;
      const touch = event.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!start.current || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const dx = touch.clientX - start.current.x;
      const dy = touch.clientY - start.current.y;
      if (dy <= 5 || dy <= Math.abs(dx) * 1.25 || window.scrollY > 0) return;
      event.preventDefault();
      const next = Math.min(92, dy * .65);
      distanceRef.current = next;
      setDistance(next);
      setPulling(true);
    };

    const onTouchEnd = () => {
      if (!start.current) return;
      const shouldRefresh = distanceRef.current >= triggerDistance;
      start.current = undefined;
      setPulling(false);
      if (!shouldRefresh) {
        reset();
        return;
      }
      setRefreshing(true);
      setDistance(54);
      void onRefresh().finally(() => {
        setRefreshing(false);
        distanceRef.current = 0;
        setDistance(0);
      });
    };

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
    element.addEventListener('touchcancel', reset, { passive: true });
    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', reset);
    };
  }, [disabled, onRefresh, refreshing]);

  return { containerRef, distance, pulling, refreshing, ready: distance >= triggerDistance };
}
