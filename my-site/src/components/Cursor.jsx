import { useEffect, useRef } from "react";
import useAnimationFrame from "../hooks/useAnimationFrame";
import { useDrag } from "../contexts/DragContext";

export default function Cursor() {
  const cursorRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const scale = useRef(1);
  const visible = useRef(false);

  const currentImage = useRef("/cursor/cursor.png");

  const { isGrabbingRef } = useDrag();

  // Event listeners (no rAF here — handled by useAnimationFrame below)
  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      return;
    }

    // default state
    isGrabbingRef.current = false;

    const move = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      mouse.current.x = x;
      mouse.current.y = y;

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
      scale.current = 0.85;
    };

    const handleUp = () => {
      scale.current = 1;
      isGrabbingRef.current = false; // release grab globally
    };

    const handleBlur = () => {
      visible.current = false;
    };

    const handleFocus = () => {
      visible.current = true;
    };

    const handleLeave = () => {
      visible.current = false;
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);

      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [isGrabbingRef]);

  // Animation (shared rAF scheduler)
  useAnimationFrame(() => {
    pos.current.x = mouse.current.x;
    pos.current.y = mouse.current.y;

    // SWITCH CURSOR IMAGE BASED ON GLOBAL STATE
    const nextImage = isGrabbingRef.current
      ? "/cursor/CursorGrab.png"
      : "/cursor/Cursor.png";

      if (cursorRef.current) {
        if (currentImage.current !== nextImage) {
          cursorRef.current.src = nextImage;
          currentImage.current = nextImage;
        }

        cursorRef.current.style.transform = `
          translate(${pos.current.x}px, ${pos.current.y}px)
          translate(-50%, -50%)
          scale(${scale.current})
        `;

        cursorRef.current.style.opacity = visible.current ? "1" : "0";
      }
  });

  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    return null;
  }

  return (
    <img
      ref={cursorRef}
      src="/cursor/Cursor.png"
      alt="cursor"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className="custom-cursor"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "3.5vw",
        pointerEvents: "none",
        zIndex: 99999,
        willChange: "transform",
        display: "block",
        opacity: 0,
        transition: "opacity 0.15s ease",

        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitUserDrag: "none",
      }}
    />
  );
}