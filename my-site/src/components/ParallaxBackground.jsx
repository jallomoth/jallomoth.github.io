import { useEffect, useRef } from "react";

export default function ParallaxBackground() {
  const bgRef = useRef(null);

  const target = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const handleMouseMove = (e) => {
      target.current.x = e.clientX / window.innerWidth - 0.5;
      target.current.y = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let frame;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      if (document.hidden) {
        frame = requestAnimationFrame(animate);
        lastTime = currentTime;
        return;
      }

      const deltaTime = (currentTime - lastTime) / (1000 / 60); // Normalize to 60fps
      lastTime = currentTime;

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

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    const handleVisibility = () => {
      if (document.hidden) {
        if (frame) cancelAnimationFrame(frame);
        frame = null;
      } else {
        lastTime = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

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