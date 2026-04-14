import { useEffect, useRef } from "react";

export default function ParallaxBackground() {
  const bgRef = useRef(null);

  const target = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      target.current.x = e.clientX / window.innerWidth - 0.5;
      target.current.y = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let frame;

    const animate = () => {
      // Acceleration toward mouse direction
      velocity.current.x += (target.current.x * 0.6 - velocity.current.x) * 0.02;
      velocity.current.y += (target.current.y * 0.6 - velocity.current.y) * 0.02;

      // Apply movement
      pos.current.x += velocity.current.x;
      pos.current.y += velocity.current.y;

      // Friction (momentum decay)
      velocity.current.x *= 0.5;
      velocity.current.y *= 0.5;

      if (bgRef.current) {
        const strength = window.innerWidth * 0.015;

        bgRef.current.style.backgroundPosition = `
          ${-pos.current.x * strength}px 
          ${-pos.current.y * strength}px
        `;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
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
        backgroundSize: "clamp(1100px, 60vw, 2400px) clamp(1100px, 60vw, 2400px)",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}