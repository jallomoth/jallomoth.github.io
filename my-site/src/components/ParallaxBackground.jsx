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

      bgRef.current.style.backgroundPosition = `
        ${-pos.current.x * strength}px 
        ${-pos.current.y * strength}px
      `;
    }
  });

  return (
    <div
      ref={bgRef}
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/background/space.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "60vw 60vw",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}