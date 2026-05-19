// Navigation button — supports internal routes, external links, and action
// callbacks. Has a drag-and-fling physics system: buttons spring back to
// their origin, and nearby buttons are magnetically repelled while dragging.
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAnimationFrame from "../hooks/useAnimationFrame";
import { useDrag } from "../contexts/DragContext";
import "./NavButton.css";

// threshold for treating a drag as a click (pixels)
const DRAG_THRESHOLD = 80;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function NavButton({ image, hoverImage, to, alt, label, textImage, textLabel, onAction }) {
  const [hovered, setHovered] = useState(false);
  const [draggingState, setDraggingState] = useState(false);

  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const navigate = useNavigate();

  const isDragging = useRef(false);

  const mouse = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const pos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  // Tracks position from the previous rAF frame to compute framerate-independent fling velocity
  const prevDragPosRef = useRef({ x: 0, y: 0 });

  const { isGrabbingRef, isDraggingButtonRef, draggedButtonPosRef } = useDrag();
  const lastTimeRef = useRef(performance.now());

  const isExternal = /^https?:\/\//.test(to) || to?.startsWith("//");
  const isActive = hovered || draggingState;
  const src = isActive && hoverImage ? hoverImage : image;
  const altText = alt || label || "Navigation button";

  // --- FIXED NAVIGATION ---
  // Opens external URLs in a new tab; uses React Router for internal paths.
  const navigateTo = () => {
    if (onAction) { onAction(); return; }
    if (!to || to === "#") return;
    if (isExternal) {
      window.open(to, "_blank", "noopener,noreferrer");
    } else {
      navigate(to);
    }
  };

  // --- DRAG PHYSICS ---
  // Mouse events only — the animation loop (useAnimationFrame below) does
  // the actual position update every frame.
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!isDragging.current) return;

      pos.current.x = mouse.current.x - dragOffset.current.x;
      pos.current.y = mouse.current.y - dragOffset.current.y;

      draggedButtonPosRef.current = {
        x: mouse.current.x,
        y: mouse.current.y,
      };

      if (iconRef.current) {
        iconRef.current.style.setProperty(
          "--translate-x",
          `${pos.current.x}px`
        );
        iconRef.current.style.setProperty(
          "--translate-y",
          `${pos.current.y}px`
        );
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setDraggingState(false);

        isGrabbingRef.current = false;
        isDraggingButtonRef.current = false;
        draggedButtonPosRef.current = null;

        setHovered(false);

        // Boost the tracked velocity so the fling carries visible momentum.
        // Same approach as Logo: multiply by a constant, then let spring + damping take over.
        const FLING_BOOST = 8;
        velocity.current.x *= FLING_BOOST;
        velocity.current.y *= FLING_BOOST;

        // --- DISTANCE CHECK ---
        // Only navigate if the button was barely moved (treated as a click).
        const distance = Math.sqrt(
          pos.current.x * pos.current.x +
          pos.current.y * pos.current.y
        );

        const shouldNavigate = distance < DRAG_THRESHOLD;

        if (shouldNavigate) {
          setTimeout(() => {
            navigateTo();
          }, 180);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [navigate, to]);

  // Spring + magnetic animation (shared rAF scheduler)
  useAnimationFrame((currentTime) => {
    if (prefersReducedMotion) return;
    const deltaTime = Math.min(
      (currentTime - lastTimeRef.current) / (1000 / 60),
      2
    );
    lastTimeRef.current = currentTime;

    if (!isDragging.current) {
      const spring = 0.2;
      const damping = 0.7;

      velocity.current.x += (0 - pos.current.x) * spring * deltaTime;
      velocity.current.y += (0 - pos.current.y) * spring * deltaTime;

      velocity.current.x *= Math.pow(damping, deltaTime);
      velocity.current.y *= Math.pow(damping, deltaTime);

      pos.current.x += velocity.current.x * deltaTime;
      pos.current.y += velocity.current.y * deltaTime;
    } else {
      // Normalize velocity to pixels-per-60fps-frame so fling feels the same
      // on 60 Hz, 120 Hz, 144 Hz monitors.
      const MAX_FLING = 40;
      const norm = deltaTime > 0 ? 1 / deltaTime : 1;
      velocity.current.x = Math.max(-MAX_FLING, Math.min(MAX_FLING,
        (pos.current.x - prevDragPosRef.current.x) * norm));
      velocity.current.y = Math.max(-MAX_FLING, Math.min(MAX_FLING,
        (pos.current.y - prevDragPosRef.current.y) * norm));
    }

    prevDragPosRef.current.x = pos.current.x;
    prevDragPosRef.current.y = pos.current.y;

    if (!isDragging.current && draggedButtonPosRef.current) {
      const rect = iconRef.current.getBoundingClientRect();

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = cx - draggedButtonPosRef.current.x;
      const dy = cy - draggedButtonPosRef.current.y;

      const dist = Math.sqrt(dx * dx + dy * dy);

      const RADIUS = 350;

      if (dist < RADIUS) {
        const force = (RADIUS - dist) / RADIUS;

        pos.current.x += (dx / dist) * force * 20 * deltaTime;
        pos.current.y += (dy / dist) * force * 20 * deltaTime;
      }
    }

    if (iconRef.current) {
      iconRef.current.style.setProperty('--translate-x', `${pos.current.x}px`);
      iconRef.current.style.setProperty('--translate-y', `${pos.current.y}px`);
    }
  });

  // --- START DRAG ---
  const handleMouseDown = (e) => {
    e.preventDefault();

    isDragging.current = true;
    setDraggingState(true);

    isGrabbingRef.current = true;
    isDraggingButtonRef.current = true;

    dragOffset.current.x = e.clientX - pos.current.x;
    dragOffset.current.y = e.clientY - pos.current.y;

    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;

    velocity.current.x = 0;
    velocity.current.y = 0;
    prevDragPosRef.current.x = pos.current.x;
    prevDragPosRef.current.y = pos.current.y;
  };

  // --- HOVER CONTROL ---
  // Suppress hover state while any button is being dragged globally.
  const handleEnter = () => {
    if (!isDraggingButtonRef.current) setHovered(true);
  };

  const handleLeave = () => {
    if (!isDraggingButtonRef.current) setHovered(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateTo();
    }
  };

  return (
    <div
      ref={containerRef}
      className="nav-button-container"
      role="button"
      tabIndex={0}
      aria-label={altText}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={iconRef}
        className={`icon-container ${isActive ? "active-icon" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className="icon-visual">
          <img
            src={src}
            className="nav-button-image"
            alt={altText}
            draggable="false"
          />
        </div>
      </div>
      {(textImage || textLabel) && (
        <div
          className={`text-container ${isActive ? "active-text" : ""}`}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={navigateTo}
        >
          {textImage ? (
            <img
              src={textImage}
              className="text-image"
              alt=""
              draggable="false"
            />
          ) : (
            <span className="text-label">{textLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}