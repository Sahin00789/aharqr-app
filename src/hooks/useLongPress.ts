import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";

export interface UseLongPressOptions {
  /** How long (ms) the pointer must be held before `onLongPress` fires. */
  duration?: number;
  /** Fires when the pointer is released after a SHORT press (a normal click). */
  onShortPress?: () => void;
  /** Fires when the pointer is held for `duration` ms. */
  onLongPress?: () => void;
}

export interface UseLongPressHandlers {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
  onClick: () => void;
  onContextMenu: (e: ReactMouseEvent) => void;
}

/**
 * `useLongPress` — distinguishes a long press from a short click on a single
 * element. Spread the returned handlers onto the element:
 *
 *   const handlers = useLongPress({ onLongPress, onShortPress: onClick });
 *   <button {...handlers} />
 *
 * How it stays collision-free:
 * - `pointer down`  → starts a timer for `duration` (also resets per gesture).
 * - timer fires      → marks "long press happened" and calls `onLongPress`.
 * - `pointer up/leave/move` → clears the timer (short press path).
 * - native `click`   → is the single place `onShortPress` fires; if a long
 *   press already fired this gesture, the trailing `click` is swallowed so a
 *   short-click and long-press never both fire.
 */
export function useLongPress({
  duration = 500,
  onShortPress,
  onLongPress,
}: UseLongPressOptions = {}): UseLongPressHandlers {
  const timerRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPress = useCallback(() => {
    if (!onLongPress) return;
    clearTimer();
    longPressFiredRef.current = false;
    timerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress();
    }, duration);
  }, [clearTimer, duration, onLongPress]);

  // Cancel the pending long-press on release without firing the short press —
  // the short press is decided inside the native `click` handler instead.
  const endPress = useCallback(() => clearTimer(), [clearTimer]);

  const handleMouseDown = useCallback(() => startPress(), [startPress]);
  const handleMouseUp = useCallback(() => endPress(), [endPress]);
  const handleMouseLeave = useCallback(() => clearTimer(), [clearTimer]);
  const handleTouchStart = useCallback(() => startPress(), [startPress]);
  const handleTouchEnd = useCallback(() => endPress(), [endPress]);
  const handleTouchMove = useCallback(() => clearTimer(), [clearTimer]);

  const handleClick = useCallback(() => {
    // A long press fired during this gesture — swallow the `click` that the
    // browser dispatches on release so only ONE of the two callbacks runs.
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    onShortPress?.();
  }, [onShortPress]);

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      // Long-press gestures can trigger the browser's native context menu /
      // text-selection callout (especially on touch devices). Suppress it.
      e.preventDefault();
    },
    [],
  );

  // Belt-and-braces: never leak a pending timer if the owner unmounts mid-hold.
  useEffect(() => clearTimer, [clearTimer]);

  return {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onClick: handleClick,
    onContextMenu: handleContextMenu,
  };
}