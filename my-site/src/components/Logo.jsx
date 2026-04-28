import { useState, useRef, useEffect } from "react";
import { useAudio } from "./audio/AudioContext";
import useAnimationFrame from "../hooks/useAnimationFrame";
import { useDrag } from "../contexts/DragContext";
import "./Logo.css";

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Logo({
  top = "10%",
  left = "50%",
  width = "60vw",
  center = true,
  className = "",
  src = "/logo/Jallogo.png",
  hoverSrc = "/logo/JallogoHover.png",
}) {
  const [hovered, setHovered] = useState(false);
  const [effects, setEffects] = useState([]);

  const containerRef = useRef(null);

  const isDragging = useRef(false);
  const hoveredRef = useRef(false);
  const hoverScaleRef = useRef(1);

  const mouse = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const pos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  // Tracks the position from the previous frame so we can compute drag velocity for fling
  const prevDragPosRef = useRef({ x: 0, y: 0 });

  const { effectiveVolume, playSound } = useAudio();
  // Ref so the physics closure always reads the latest volume without restarting
  const effectiveVolumeRef = useRef(effectiveVolume);
  const { isGrabbingRef } = useDrag();
  const lastTimeRef = useRef(performance.now());

  // -----------------------------
  // POPUP SCALE CALC
  // -----------------------------
  const getPopupSize = () => {
    // base reference = 60vw logo → 3vw popup
    const baseLogo = 60;
    const basePopup = 3;

    if (width.includes("vw")) {
      const value = parseFloat(width);
      const scale = value / baseLogo;
      return `${basePopup * scale}vw`;
    }

    // fallback for px
    if (width.includes("px")) {
      const value = parseFloat(width);
      const scale = value / 600; // assume ~600px = 60vw baseline
      return `${basePopup * scale}vw`;
    }

    return "3vw";
  };

  const popupSize = getPopupSize();

  // Keep effectiveVolumeRef in sync so the physics closure reads the latest value
  useEffect(() => {
    effectiveVolumeRef.current = effectiveVolume;
  }, [effectiveVolume]);

  // physics — event listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!isDragging.current) return;

      pos.current.x = mouse.current.x - dragOffset.current.x;
      pos.current.y = mouse.current.y - dragOffset.current.y;
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        isGrabbingRef.current = false;

        // Boost the velocity that the rAF loop tracked this frame so the fling
        // carries visible momentum against the spring. Without this boost the
        // strong damping (0.8/frame) kills the velocity within 1–2 frames.
        const FLING_BOOST = 8;
        velocity.current.x *= FLING_BOOST;
        velocity.current.y *= FLING_BOOST;

        const distance = Math.sqrt(
          pos.current.x * pos.current.x +
          pos.current.y * pos.current.y
        );

        const THRESHOLD = 500;

        if (distance > THRESHOLD) {
          const strength = Math.min(distance / 300, 1);
          playSound("/sounds/snap.mp3", effectiveVolumeRef.current * (0.4 + strength * 0.6));
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [playSound, isGrabbingRef]);

  // physics — animation loop (shared rAF scheduler)
  useAnimationFrame((currentTime) => {
    if (prefersReducedMotion) return;
    const deltaTime = Math.min(
      (currentTime - lastTimeRef.current) / (1000 / 60),
      2
    );
    lastTimeRef.current = currentTime;

    if (!isDragging.current) {
      const spring = 0.16;
      const damping = 0.8;

      velocity.current.x += (0 - pos.current.x) * spring * deltaTime;
      velocity.current.y += (0 - pos.current.y) * spring * deltaTime;

      velocity.current.x *= Math.pow(damping, deltaTime);
      velocity.current.y *= Math.pow(damping, deltaTime);

      pos.current.x += velocity.current.x * deltaTime;
      pos.current.y += velocity.current.y * deltaTime;
    } else {
      // Normalize velocity to "pixels per 60fps-equivalent frame" by dividing the
      // raw pixel delta by deltaTime. This makes fling feel identical on 60Hz, 120Hz,
      // 144Hz, etc. — a fast throw always produces the same velocity regardless of
      // how many frames elapsed since the last rAF.
      const MAX_FLING = 40;
      const norm = deltaTime > 0 ? 1 / deltaTime : 1;
      velocity.current.x = Math.max(-MAX_FLING, Math.min(MAX_FLING,
        (pos.current.x - prevDragPosRef.current.x) * norm));
      velocity.current.y = Math.max(-MAX_FLING, Math.min(MAX_FLING,
        (pos.current.y - prevDragPosRef.current.y) * norm));
    }

    prevDragPosRef.current.x = pos.current.x;
    prevDragPosRef.current.y = pos.current.y;

    if (containerRef.current) {
      // Lerp the hover scale for a smooth grow/shrink without needing a CSS transition.
      const targetScale = hoveredRef.current ? 1.06 : 1;
      hoverScaleRef.current += (targetScale - hoverScaleRef.current) * 0.15 * deltaTime;

      containerRef.current.style.transform = `
        ${center ? "translate(-50%, -50%)" : ""}
        translate(${pos.current.x}px, ${pos.current.y}px)
        scale(${hoverScaleRef.current})
      `;
    }
  });

  const handleMouseDown = (e) => {
    e.preventDefault();

    isDragging.current = true;
    isGrabbingRef.current = true;

    dragOffset.current.x = e.clientX - pos.current.x;
    dragOffset.current.y = e.clientY - pos.current.y;

    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;

    const id = Date.now();

    setEffects((prev) => [
      ...prev,
      {
        id,
        x: e.clientX,
        y: e.clientY - 40,
      },
    ]);

    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 500);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isGrabbingRef.current = false;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () =>
      window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isGrabbingRef]);

  return (
    <>
      <div
        ref={containerRef}
        className={`logo-container${className ? ` ${className}` : ""}`}
        style={{ top, left, width }}
        onMouseEnter={() => { setHovered(true); hoveredRef.current = true; }}
        onMouseLeave={() => { setHovered(false); hoveredRef.current = false; }}
        onMouseDown={handleMouseDown}
      >
        <img
          src={src}
          draggable={false}
          className={`logo-img ${hovered ? "fade-out" : "fade-in"}`}
          alt="Logo"
        />
        <img
          src={hoverSrc}
          draggable={false}
          className={`logo-img logo-hover ${
            hovered ? "fade-in" : "fade-out"
          }`}
          alt="Logo Hover"
        />
      </div>

      {effects.map((effect) => (
        <img
          key={effect.id}
          src="/logo/popup.png"
          className="click-effect"
          style={{
            left: effect.x,
            top: effect.y,
            width: popupSize,
            height: popupSize,
          }}
          alt=""
        />
      ))}
    </>
  );
}