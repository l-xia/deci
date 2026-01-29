import { useRef, useCallback } from 'react';

/** Pixel threshold for movement before canceling long press */
const DRAG_THRESHOLD_PX = 10;

interface LongPressOptions {
  onLongPress: (e: React.TouchEvent | React.MouseEvent) => void;
  delay?: number;
  shouldPreventDefault?: boolean;
}

export function useLongPress({
  onLongPress,
  delay = 500,
  shouldPreventDefault = true,
}: LongPressOptions) {
  const timerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      // Get position from touch or mouse event
      const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

      startPosRef.current = { x: clientX, y: clientY };

      timerRef.current = window.setTimeout(() => {
        if (shouldPreventDefault) {
          e.preventDefault();
        }
        onLongPress(e);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  const move = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      // Cancel if finger/mouse moves too much (> 10px)
      if (!startPosRef.current) return;

      const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

      const deltaX = Math.abs(clientX - startPosRef.current.x);
      const deltaY = Math.abs(clientY - startPosRef.current.y);

      if (deltaX > DRAG_THRESHOLD_PX || deltaY > DRAG_THRESHOLD_PX) {
        cancel();
      }
    },
    [cancel]
  );

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: move,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseMove: move,
    onMouseLeave: cancel,
  };
}
