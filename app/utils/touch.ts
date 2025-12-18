// Touch and swipe detection utilities for mobile game controls

export type SwipeDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type TouchPosition = { x: number; y: number };

export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  duration: number;
}

export interface TouchHandlers {
  onSwipe?: (event: SwipeEvent) => void;
  onTap?: (position: TouchPosition) => void;
  onLongPress?: (position: TouchPosition) => void;
}

const SWIPE_THRESHOLD = 50; // Minimum distance in pixels to register as swipe
const LONG_PRESS_DURATION = 500; // Duration in ms to register as long press
const TAP_MAX_DURATION = 200; // Maximum duration for tap
const TAP_MAX_MOVEMENT = 10; // Maximum movement in pixels for tap

/**
 * Detects swipe direction from touch start and end positions
 */
export function detectSwipeDirection(
  startPos: TouchPosition,
  endPos: TouchPosition
): SwipeDirection | null {
  const deltaX = endPos.x - startPos.x;
  const deltaY = endPos.y - startPos.y;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  // Check if movement exceeds threshold
  if (absDeltaX < SWIPE_THRESHOLD && absDeltaY < SWIPE_THRESHOLD) {
    return null;
  }

  // Determine dominant direction
  if (absDeltaX > absDeltaY) {
    return deltaX > 0 ? "RIGHT" : "LEFT";
  } else {
    return deltaY > 0 ? "DOWN" : "UP";
  }
}

/**
 * Calculate distance between two touch positions
 */
export function calculateDistance(start: TouchPosition, end: TouchPosition): number {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

/**
 * Get touch position relative to target element
 */
export function getTouchPosition(
  touch: Touch,
  element: HTMLElement
): TouchPosition {
  const rect = element.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

/**
 * Hook for handling touch events with swipe, tap, and long-press detection
 */
export function useTouchHandlers(handlers: TouchHandlers) {
  let touchStartPos: TouchPosition | null = null;
  let touchStartTime: number = 0;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let isLongPress = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchStartPos = {
      x: touch.clientX,
      y: touch.clientY,
    };
    touchStartTime = Date.now();
    isLongPress = false;

    // Set up long press detection
    if (handlers.onLongPress) {
      longPressTimer = setTimeout(() => {
        if (touchStartPos && handlers.onLongPress) {
          isLongPress = true;
          handlers.onLongPress(touchStartPos);
        }
      }, LONG_PRESS_DURATION);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartPos || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    const distance = calculateDistance(touchStartPos, currentPos);

    // Cancel long press if moved too much
    if (distance > TAP_MAX_MOVEMENT && longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (!touchStartPos) return;

    const touchEndTime = Date.now();
    const duration = touchEndTime - touchStartTime;
    const touch = e.changedTouches[0];
    const touchEndPos = {
      x: touch.clientX,
      y: touch.clientY,
    };

    const distance = calculateDistance(touchStartPos, touchEndPos);

    // Don't process if it was a long press
    if (isLongPress) {
      touchStartPos = null;
      return;
    }

    // Check for tap
    if (distance < TAP_MAX_MOVEMENT && duration < TAP_MAX_DURATION && handlers.onTap) {
      handlers.onTap(touchStartPos);
      touchStartPos = null;
      return;
    }

    // Check for swipe
    if (handlers.onSwipe) {
      const direction = detectSwipeDirection(touchStartPos, touchEndPos);
      if (direction) {
        handlers.onSwipe({ direction, distance, duration });
      }
    }

    touchStartPos = null;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

