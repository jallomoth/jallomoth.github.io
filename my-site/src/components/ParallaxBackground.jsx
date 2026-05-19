// Tiling parallax background — moves in response to mouse position (desktop)
// or device orientation (mobile gyroscope). Uses a shared rAF loop and GPU
// compositing (transform instead of backgroundPosition) so backdrop-filter
// on overlapping elements can sample it correctly.
import { useEffect, useRef } from "react";
import useAnimationFrame from "../hooks/useAnimationFrame";

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ParallaxBackground() {
  const bgRef = useRef(null);

  const target = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(performance.now());

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      target.current.x = e.clientX / window.innerWidth - 0.5;
      target.current.y = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Device orientation tracking (mobile gyroscope parallax)
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!('DeviceOrientationEvent' in window)) return;

    const handleOrientation = (e) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma: left/right tilt (-90 to 90 degrees)
      // beta:  front/back tilt (-180 to 180 degrees); subtract 30° for
      //        the natural forward-tilted angle when holding a phone
      target.current.x = Math.max(-0.5, Math.min(0.5, e.gamma / 45));
      target.current.y = Math.max(-0.5, Math.min(0.5, (e.beta - 30) / 45));
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // Animation (shared rAF scheduler)
  useAnimationFrame((currentTime) => {
    if (prefersReducedMotion) return;
    const deltaTime = (currentTime - lastTimeRef.current) / (1000 / 60);
    lastTimeRef.current = currentTime;

    // Acceleration toward mouse direction
    velocity.current.x += (target.current.x * 0.6 - velocity.current.x) * 0.1 * deltaTime;
    velocity.current.y += (target.current.y * 0.6 - velocity.current.y) * 0.1 * deltaTime;

    // Apply movement
    pos.current.x += velocity.current.x * deltaTime;
    pos.current.y += velocity.current.y * deltaTime;

    // Friction (momentum decay)
    velocity.current.x *= Math.pow(0.5, deltaTime);
    velocity.current.y *= Math.pow(0.5, deltaTime);

    if (bgRef.current) {
      const strength = window.innerWidth * 0.015;
      // Tile size in px (matches backgroundSize: "60vw 60vw")
      const tileSize = window.innerWidth * 0.6;

      // Use transform instead of backgroundPosition so this element is a
      // proper GPU compositor layer — backdrop-filter can then sample it.
      // Modulo-wrap within one tile period for seamless infinite tiling.
      const tx = ((-pos.current.x * strength) % tileSize + tileSize) % tileSize;
      const ty = ((-pos.current.y * strength) % tileSize + tileSize) % tileSize;

      bgRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
    }
  });

  return (
    <div
      ref={bgRef}
      style={{
        position: "fixed",
        // Extend one full tile-width (60vw) beyond viewport on every side so
        // the translated div never shows a gap at the edges.
        top: "-60vw",
        left: "-60vw",
        right: "-60vw",
        bottom: "-60vw",
        backgroundImage: "url('/background/space.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "60vw 60vw",
        zIndex: -1,
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}