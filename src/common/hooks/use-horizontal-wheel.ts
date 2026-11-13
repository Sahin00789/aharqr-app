import { useEffect, type RefObject } from "react";

/**
 * Makes a horizontal rail respond to a plain mouse wheel.
 *
 * Touch and trackpad gestures already pan horizontally, but a desktop mouse
 * only sends `deltaY` — without this the month/day pill rails look frozen.
 * The listener is attached natively (non-passive) so `preventDefault` works.
 */
export function useHorizontalWheel<T extends HTMLElement>(
  ref: RefObject<T | null>,
) {
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    const onWheel = (event: WheelEvent) => {
      if (rail.scrollWidth <= rail.clientWidth) return;
      // Real horizontal gestures (trackpad / shift+wheel) scroll natively.
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [ref]);
}
