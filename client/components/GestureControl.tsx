import React, { useEffect, useRef, useState } from "react";
import { useDevice } from "@/hooks/use-device";

interface GestureControlProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  enabled?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startDistance?: number;
  startTime: number;
  isGesture: boolean;
}

export default function GestureControl({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchIn,
  onPinchOut,
  onDoubleTap,
  onLongPress,
  enabled = true,
}: GestureControlProps) {
  const { deviceInfo } = useDevice();
  const [gestureState, setGestureState] = useState<GestureState | null>(null);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [lastTap, setLastTap] = useState<number>(0);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only enable on touch devices
  const shouldEnable = enabled && deviceInfo.isTouch;

  const getDistance = (point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (point1: TouchPoint, point2: TouchPoint): number => {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!shouldEnable) return;

    e.preventDefault();
    const touches = Array.from(e.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    }));

    setTouchPoints(touches);

    if (touches.length === 1) {
      // Single touch - potential swipe or tap
      const touch = touches[0];
      setGestureState({
        startX: touch.x,
        startY: touch.y,
        currentX: touch.x,
        currentY: touch.y,
        startTime: touch.timestamp,
        isGesture: false,
      });

      // Start long press timer
      longPressTimeout.current = setTimeout(() => {
        onLongPress?.();
      }, 500);
    } else if (touches.length === 2) {
      // Two touches - potential pinch
      const distance = getDistance(touches[0], touches[1]);
      setGestureState({
        startX: (touches[0].x + touches[1].x) / 2,
        startY: (touches[0].y + touches[1].y) / 2,
        currentX: (touches[0].x + touches[1].x) / 2,
        currentY: (touches[0].y + touches[1].y) / 2,
        startDistance: distance,
        startTime: touches[0].timestamp,
        isGesture: false,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!shouldEnable || !gestureState) return;

    e.preventDefault();
    const touches = Array.from(e.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    }));

    setTouchPoints(touches);

    if (touches.length === 1) {
      // Single touch movement
      const touch = touches[0];
      const deltaX = Math.abs(touch.x - gestureState.startX);
      const deltaY = Math.abs(touch.y - gestureState.startY);

      // Determine if this is a gesture (minimum movement threshold)
      if (deltaX > 50 || deltaY > 50) {
        setGestureState(prev => prev ? { ...prev, isGesture: true } : null);
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
          longPressTimeout.current = null;
        }
      }

      setGestureState(prev => prev ? {
        ...prev,
        currentX: touch.x,
        currentY: touch.y,
      } : null);
    } else if (touches.length === 2 && gestureState.startDistance) {
      // Two touch movement - pinch gesture
      const currentDistance = getDistance(touches[0], touches[1]);
      const distanceChange = currentDistance - gestureState.startDistance;

      if (Math.abs(distanceChange) > 20) {
        setGestureState(prev => prev ? { ...prev, isGesture: true } : null);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!shouldEnable || !gestureState) return;

    e.preventDefault();
    const endTime = Date.now();
    const duration = endTime - gestureState.startTime;

    // Clear long press timer
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    if (touchPoints.length === 1 && !gestureState.isGesture) {
      // Single tap detection
      const deltaX = Math.abs(gestureState.currentX - gestureState.startX);
      const deltaY = Math.abs(gestureState.currentY - gestureState.startY);

      if (deltaX < 10 && deltaY < 10 && duration < 300) {
        // This is a tap
        const timeSinceLastTap = endTime - lastTap;
        if (timeSinceLastTap < 300) {
          // Double tap detected
          onDoubleTap?.();
        }
        setLastTap(endTime);
      }
    } else if (gestureState.isGesture) {
      // Gesture detection
      const deltaX = gestureState.currentX - gestureState.startX;
      const deltaY = gestureState.currentY - gestureState.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (touchPoints.length === 1) {
        // Swipe gesture
        if (absDeltaX > absDeltaY && absDeltaX > 50) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else if (absDeltaY > absDeltaX && absDeltaY > 50) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      } else if (touchPoints.length === 2 && gestureState.startDistance) {
        // Pinch gesture
        const currentDistance = getDistance(touchPoints[0], touchPoints[1]);
        const distanceChange = currentDistance - gestureState.startDistance;

        if (Math.abs(distanceChange) > 50) {
          if (distanceChange > 0) {
            onPinchOut?.();
          } else {
            onPinchIn?.();
          }
        }
      }
    }

    setGestureState(null);
    setTouchPoints([]);
  };

  const handleTouchCancel = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    setGestureState(null);
    setTouchPoints([]);
  };

  useEffect(() => {
    return () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };
  }, []);

  if (!shouldEnable) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ touchAction: 'none' }}
      className="gesture-control"
    >
      {children}
      
      {/* Visual feedback for gestures */}
      {gestureState?.isGesture && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg px-4 py-2 text-sm font-medium shadow-lg">
              Gesture detected
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
