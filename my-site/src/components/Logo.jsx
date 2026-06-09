// Site logo — draggable with spring physics and a fling effect on release.
// Swaps to a hover image on mouse-over and plays a snap sound when thrown
// far enough. Spawns a small pop image at the click point.
// Tracks lifetime click count in localStorage and shows a milestone number
// popup at certain thresholds.
import { useState, useRef, useEffect } from "react";
import { useAudio } from "../contexts/AudioContext";
import useAnimationFrame from "../hooks/useAnimationFrame";
import { useDrag } from "../contexts/DragContext";
import "./Logo.css";

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Milestone click counts that trigger a number popup.
const MILESTONES = new Set([10, 21, 25, 50, 67, 69, 100, 250, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 7500, 10000]);

// Sound to play for each milestone. Unspecified milestones fall back to a default.
const MILESTONE_SOUNDS = {
  21:    "/sounds/logo/21.mp3",
  67:    "/sounds/logo/67.mp3",
  69:    "/sounds/logo/69.mp3",
  100:   "/sounds/logo/100.mp3",
  500:   "/sounds/logo/500.mp3",
  1000:  "/sounds/logo/1000.mp3",
};

function getClickCount() {
  return parseInt(localStorage.getItem("logo-click-count") || "0", 10);
}

function incrementClickCount() {
  const next = getClickCount() + 1;
  localStorage.setItem("logo-click-count", String(next));
  return next;
}

export default function Logo({
  top = "10%",
  left = "50%",
  width = "60vw",
  center = true,
  className = "",
  src = "/logo/Jallogo.png",
  hoverSrc = "/logo/Jallogo-hover.png",
  ssRef,
  ssIndex,
}) {
  const [hovered, setHovered] = useState(false);
  const [effects, setEffects] = useState([]);
  const [milestonePopups, setMilestonePopups] = useState([]);

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

  // --- POPUP SCALE ---
  // Compute popup size from the actual rendered logo width so popups
  // stay proportional across pages (handles clamp(), rem, vw, etc.).
  const [popupSize, setPopupSize] = useState(() => {
    // initial fallback in px
    return '48px';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const el = containerRef.current;
    const computeAndSet = (w) => {
      const sizePx = Math.max(16, Math.round(w * 0.07)); // 8% of logo width (smaller)
      setPopupSize(`${sizePx}px`);
    };

    // If ResizeObserver available, observe the container for size changes.
    let ro;
    if (window.ResizeObserver && el) {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          computeAndSet(entry.contentRect.width);
        }
      });
      ro.observe(el);
      // set initial
      computeAndSet(el.getBoundingClientRect().width);
    } else if (el) {
      // fallback: use bounding rect and window resize
      computeAndSet(el.getBoundingClientRect().width);
      const onResize = () => computeAndSet(el.getBoundingClientRect().width);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    return () => {
      if (ro) ro.disconnect();
    };
  }, [width]);

  const milestoneFontSize = `${Math.round(parseFloat(popupSize) * 1.1)}px`;

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
          playSound("/sounds/logo/Snap.mp3", effectiveVolumeRef.current * (strength * 0.6));
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

    // --- SCREENSAVER OVERRIDE ---
    // When the screensaver is active the centralized physics engine in Home.jsx
    // owns the logo's position. Read the entity offset and write directly to DOM.
    if (!isDragging.current && ssRef?.current) {
      const e = ssRef.current.entities?.[ssIndex];
      if (e !== undefined) {
        pos.current.x = e.x - e.naturalX;
        pos.current.y = e.y - e.naturalY;
        if (containerRef.current) {
          containerRef.current.style.transform = `
            ${center ? "translate(-50%, -50%)" : ""}
            translate(${pos.current.x}px, ${pos.current.y}px)
            scale(${hoverScaleRef.current})
          `;
        }
        return;
      }
    }

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
    // During screensaver, don't start a drag — the global wake() handler (capture
    // phase) will deactivate the screensaver before this fires.
    if (ssRef?.current) return;

    e.preventDefault();

    isDragging.current = true;
    isGrabbingRef.current = true;

    dragOffset.current.x = e.clientX - pos.current.x;
    dragOffset.current.y = e.clientY - pos.current.y;

    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;

    const id = Date.now();

    // --- CLICK COUNTER ---
    // Increment the lifetime click count and fire a milestone popup if needed.
    const newCount = incrementClickCount();
    window.dispatchEvent(
      new CustomEvent("logo-click-count-changed", { detail: { count: newCount } })
    );
    if (MILESTONES.has(newCount)) {
      playSound(
        MILESTONE_SOUNDS[newCount] ?? "/sounds/logo/Counter.mp3",
        effectiveVolumeRef.current * 0.85
      );
      const popupId = id + 1;
      setMilestonePopups((prev) => [
        ...prev,
        { id: popupId, x: e.clientX, y: e.clientY - 40, text: String(newCount) },
      ]);
      setTimeout(() => {
        setMilestonePopups((prev) => prev.filter((p) => p.id !== popupId));
      }, 900);
    }

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
        data-ss-index={ssIndex}
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
          src="/logo/Popup.png"
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

      {milestonePopups.map((popup) => (
        <span
          key={popup.id}
          className="milestone-popup"
          style={{ left: popup.x, top: popup.y, fontSize: milestoneFontSize }}
          aria-live="polite"
        >
          {popup.text}
        </span>
      ))}
    </>
  );
}