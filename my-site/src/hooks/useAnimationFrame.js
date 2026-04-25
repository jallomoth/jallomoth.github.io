import { useEffect, useRef } from "react";
import { scheduleAnimation } from "../utils/animationScheduler";

/**
 * Subscribe a callback to the shared app-wide rAF loop.
 * The callback is stored in a ref so it never needs to be stable (no
 * useCallback required at the call site); the latest version is always
 * invoked each frame.
 *
 * @param {(time: DOMHighResTimeStamp) => void} callback
 */
export default function useAnimationFrame(callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback; // always up-to-date

  useEffect(() => {
    return scheduleAnimation((time) => callbackRef.current(time));
  }, []);
}
