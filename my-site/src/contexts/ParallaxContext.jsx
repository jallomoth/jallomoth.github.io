// Shared parallax physics — mouse position, velocity, and accumulated offset
// are computed once here and exposed via context so both ParallaxBackground
// and any button layer can read the same position (and invert it if needed).
import { createContext, useContext, useEffect, useRef } from "react";
import useAnimationFrame from "../hooks/useAnimationFrame";

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Context value: a ref whose `.current` is { x, y } accumulated pixel offsets.
// Defaults to a frozen-at-zero ref so consumers work even without a provider.
export const ParallaxPosContext = createContext({ current: { x: 0, y: 0 } });

export function useParallaxPos() {
  return useContext(ParallaxPosContext);
}

export function ParallaxProvider({ children }) {
  const target   = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const pos      = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(performance.now());

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      target.current.x = e.clientX / window.innerWidth  - 0.5;
      target.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Device orientation tracking (mobile gyroscope)
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!('DeviceOrientationEvent' in window)) return;

    const handleOrientation = (e) => {
      if (e.gamma === null || e.beta === null) return;
      target.current.x = Math.max(-0.5, Math.min(0.5,  e.gamma         / 45));
      target.current.y = Math.max(-0.5, Math.min(0.5, (e.beta - 30)    / 45));
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // Physics update — runs on the shared rAF loop
  useAnimationFrame((currentTime) => {
    if (prefersReducedMotion) return;
    const deltaTime = (currentTime - lastTimeRef.current) / (1000 / 60);
    lastTimeRef.current = currentTime;

    velocity.current.x += (target.current.x * 0.6 - velocity.current.x) * 0.1 * deltaTime;
    velocity.current.y += (target.current.y * 0.6 - velocity.current.y) * 0.1 * deltaTime;

    pos.current.x += velocity.current.x * deltaTime;
    pos.current.y += velocity.current.y * deltaTime;

    velocity.current.x *= Math.pow(0.5, deltaTime);
    velocity.current.y *= Math.pow(0.5, deltaTime);
  });

  return (
    <ParallaxPosContext.Provider value={pos}>
      {children}
    </ParallaxPosContext.Provider>
  );
}
