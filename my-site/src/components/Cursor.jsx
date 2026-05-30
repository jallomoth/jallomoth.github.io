// Custom cursor — replaces the OS cursor with a site-branded image that
// tracks the mouse with zero lag (position is set directly in rAF, not via
// state). Switches to a grab image while a drag is in progress. Hidden on
// touch devices where no pointer exists.
import { useEffect, useRef } from "react";
import useAnimationFrame from "../hooks/useAnimationFrame";
import { useDrag } from "../contexts/DragContext";

// Width of the cursor image in viewport-width units (must match the CSS `width` below)
const CURSOR_WIDTH_VW = 3.5;
// Hotspot: fraction of image dimensions (0–1) from the top-left corner to the fingertip.
// Adjust these two values until the fingertip aligns with the actual click point.
const HOTSPOT_X_FRAC = 0.30; // fingertip is ~30 % from the left edge
const HOTSPOT_Y_FRAC = 0.04; // fingertip is ~4 % from the top edge

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

  // --- CURSOR IMAGE ---
  // Switch to grab cursor while any draggable element is being held.
    const nextImage = isGrabbingRef.current
      ? "/cursor/CursorGrab.png"
      : "/cursor/Cursor.png";

      if (cursorRef.current) {
        if (currentImage.current !== nextImage) {
          cursorRef.current.src = nextImage;
          currentImage.current = nextImage;
        }

        // Compute the hotspot offset in pixels so the fingertip tracks the real
        // mouse position at every viewport width (cursor is sized in vw units).
        const cursorPx = CURSOR_WIDTH_VW / 100 * window.innerWidth;
        const offsetX = HOTSPOT_X_FRAC * cursorPx;
        const offsetY = HOTSPOT_Y_FRAC * cursorPx;
        cursorRef.current.style.transform = `
          translate(${pos.current.x - offsetX}px, ${pos.current.y - offsetY}px)
          scale(${scale.current})
        `;

        const ssActive = document.body.classList.contains('screensaver-active');
        cursorRef.current.style.opacity = (visible.current && !ssActive) ? "1" : "0";
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
        transition: "opacity 0.25s ease",

        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitUserDrag: "none",
      }}
    />
  );
}