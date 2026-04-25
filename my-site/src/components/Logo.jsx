import { useState, useRef, useEffect } from "react";
import { useAudio } from "./audio/AudioContext";
import useAnimationFrame from "../hooks/useAnimationFrame";
import { useDrag } from "../contexts/DragContext";
import "./Logo.css";

export default function Logo({
  top = "10%",
  left = "50%",
  width = "60vw",
  center = true,
  src = "/logo/Jallogo.png",
  hoverSrc = "/logo/JallogoHover.png",
}) {
  const [hovered, setHovered] = useState(false);
  const [effects, setEffects] = useState([]);

  const containerRef = useRef(null);

  const isDragging = useRef(false);

  const mouse = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const pos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

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
      velocity.current.x = 0;
      velocity.current.y = 0;
    }

    if (containerRef.current) {
      containerRef.current.style.transform = `
        ${center ? "translate(-50%, -50%)" : ""}
        translate(${pos.current.x}px, ${pos.current.y}px)
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
        className="logo-container"
        style={{ top, left, width }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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