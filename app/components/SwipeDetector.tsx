import { useRef, useEffect, type ReactNode } from "react";
import { useTouchHandlers, type SwipeEvent, type TouchPosition } from "../utils/touch";

interface SwipeDetectorProps {
  onSwipe?: (event: SwipeEvent) => void;
  onTap?: (position: TouchPosition) => void;
  onLongPress?: (position: TouchPosition) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Wrapper component that detects swipe gestures, taps, and long-presses.
 * Prevents default touch scrolling on the wrapped area.
 */
export function SwipeDetector({
  onSwipe,
  onTap,
  onLongPress,
  children,
  className = "",
  disabled = false,
}: SwipeDetectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const touchHandlers = useTouchHandlers({
    onSwipe: disabled ? undefined : onSwipe,
    onTap: disabled ? undefined : onTap,
    onLongPress: disabled ? undefined : onLongPress,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent default touch behavior to avoid scrolling during swipes
    const preventDefaultTouch = (e: TouchEvent) => {
      if (!disabled) {
        e.preventDefault();
      }
    };

    container.addEventListener("touchstart", touchHandlers.onTouchStart, { passive: false });
    container.addEventListener("touchmove", touchHandlers.onTouchMove, { passive: false });
    container.addEventListener("touchend", touchHandlers.onTouchEnd, { passive: false });
    container.addEventListener("touchmove", preventDefaultTouch, { passive: false });

    return () => {
      container.removeEventListener("touchstart", touchHandlers.onTouchStart);
      container.removeEventListener("touchmove", touchHandlers.onTouchMove);
      container.removeEventListener("touchend", touchHandlers.onTouchEnd);
      container.removeEventListener("touchmove", preventDefaultTouch);
    };
  }, [touchHandlers, disabled]);

  return (
    <div ref={containerRef} className={`touch-none ${className}`}>
      {children}
    </div>
  );
}

