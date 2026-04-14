import { useEffect, useRef } from "react";

export default function Cursor() {
  const cursorRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const scale = useRef(1);

  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const move = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleDown = () => {
      scale.current = 0.85; // shrink on click
    };

    const handleUp = () => {
      scale.current = 1; // return to normal
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    let frame;

    const animate = () => {
      // Smooth follow
      pos.current.x += (mouse.current.x - pos.current.x) * 0.15;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `
          translate(${pos.current.x}px, ${pos.current.y}px)
          translate(-50%, -50%)
          scale(${scale.current})
        `;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Don't render on mobile at all
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    return null;
  }

  return (
    <img
      ref={cursorRef}
      src="/cursor/cursor.png"
      alt="cursor"
      style={{
        position: "fixed",
        top: "1.3vw",
        left: "0.65vw",
        width: "3.5vw",
        pointerEvents: "none",
        zIndex: 9999,
        willChange: "transform",
        display: "block",
        opacity: 1,
      }}
    />
  );
}