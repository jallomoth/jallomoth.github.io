// Singleton rAF scheduler — runs ONE requestAnimationFrame loop for the
// entire app. Animated components subscribe via scheduleAnimation(); the
// returned function unsubscribes and automatically stops the loop when there
// are no remaining subscribers.

const callbacks = new Set();
let frameId = null;

function tick(time) {
  for (const cb of callbacks) cb(time);
  frameId = callbacks.size > 0 ? requestAnimationFrame(tick) : null;
}

/**
 * Subscribe a callback to the shared rAF loop.
 * @param {(time: DOMHighResTimeStamp) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function scheduleAnimation(callback) {
  callbacks.add(callback);
  if (frameId === null) {
    frameId = requestAnimationFrame(tick);
  }
  return () => {
    callbacks.delete(callback);
    if (callbacks.size === 0 && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
