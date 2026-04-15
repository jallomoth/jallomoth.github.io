import { useEffect, useRef } from "react";

export default function Cursor() {
  const cursorRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const scale = useRef(1);
  const visible = useRef(false);

  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      return;
    }

const move = (e) => {
  const x = e.clientX;
  const y = e.clientY;

  mouse.current.x = x;
  mouse.current.y = y;

  // if touching edge, assume leaving immediately
  if (
    x <= 10 ||
    y <= 10 ||
    x >= window.innerWidth - 10 ||
    y >= window.innerHeight - 10
  ) {
    visible.current = false;
  } else {
    visible.current = true;
  }
};

    const handleDown = () => {
      scale.current = 0.85; // shrink on click
    };

    const handleUp = () => {
      scale.current = 1;
    };

    const handleBlur = () => {
      visible.current = false; // leaving browser window
    };

    const handleFocus = () => {
      visible.current = true; // coming back
    };

    const handleLeave = () => {
      visible.current = false; // leaving document area
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    document.addEventListener("mouseleave", handleLeave);

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

        cursorRef.current.style.opacity = visible.current ? "1" : "0";
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);

      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);

      document.removeEventListener("mouseleave", handleLeave);

      cancelAnimationFrame(frame);
    };
  }, []);

  // Don't render on mobile
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    return null;
  }

return (
  <img
    ref={cursorRef}
    src="/cursor/cursor.png"
    alt="cursor"
    draggable={false} // prevents drag ghost
    onDragStart={(e) => e.preventDefault()} // extra safety
    className="custom-cursor" // needed for CSS
    style={{
      position: "fixed",
      top: "1.3vw",
      left: "0.65vw",
      width: "3.5vw",
      pointerEvents: "none",
      zIndex: 9999,
      willChange: "transform",
      display: "block",
      opacity: 0,
      transition: "opacity 0.15s ease",

      userSelect: "none",          // prevents highlight
      WebkitUserSelect: "none",    // Safari/Chrome
      WebkitUserDrag: "none",      // disables image drag
    }}
  />
);
}