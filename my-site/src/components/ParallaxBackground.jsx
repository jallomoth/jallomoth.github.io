// Tiling parallax background — moves in response to mouse position (desktop)
// or device orientation (mobile gyroscope). Uses a shared rAF loop and GPU
// compositing (transform instead of backgroundPosition) so backdrop-filter
// on overlapping elements can sample it correctly.
// Physics are managed by ParallaxProvider (ParallaxContext); this component
// only applies the resulting position to the DOM.
import { useRef } from "react";
import { useParallaxPos } from "../contexts/ParallaxContext";
import useAnimationFrame from "../hooks/useAnimationFrame";

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ParallaxBackground() {
  const bgRef = useRef(null);
  const pos = useParallaxPos();

  // Animation (shared rAF scheduler)
  useAnimationFrame(() => {
    if (prefersReducedMotion || !bgRef.current) return;

    const strength = window.innerWidth * 0.015;
    // Tile size in px (matches backgroundSize: "60vw 60vw")
    const tileSize = window.innerWidth * 0.6;

    // Use transform instead of backgroundPosition so this element is a
    // proper GPU compositor layer — backdrop-filter can then sample it.
    // Modulo-wrap within one tile period for seamless infinite tiling.
    const tx = ((-pos.current.x * strength) % tileSize + tileSize) % tileSize;
    const ty = ((-pos.current.y * strength) % tileSize + tileSize) % tileSize;

    bgRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
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