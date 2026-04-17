import { useState, useRef, useEffect } from "react";
import { useAudio } from "./AudioContext";
import "./Logo.css";

export default function Logo({
  top = "10%",
  left = "50%",
  width = "60vw",
  center = true,
}) {
  const [hovered, setHovered] = useState(false);
  const [effects, setEffects] = useState([]);

  const containerRef = useRef(null);

  const isDragging = useRef(false);

  const mouse = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const pos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  const soundRef = useRef(null);
  const { effectiveVolume } = useAudio();

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

  // preload sound
  useEffect(() => {
    const audio = new Audio("/sounds/snap.mp3");
    audio.volume = effectiveVolume;
    soundRef.current = audio;
  }, []);

  // physics
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
        window.isGrabbing = false;

        const distance = Math.sqrt(
          pos.current.x * pos.current.x +
          pos.current.y * pos.current.y
        );

        const THRESHOLD = 500;

        if (distance > THRESHOLD && soundRef.current) {
          const strength = Math.min(distance / 300, 1);

          soundRef.current.volume =
            effectiveVolume * (0.4 + strength * 0.6);

          soundRef.current.currentTime = 0;
          soundRef.current.play().catch(() => {});
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    let frame;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = Math.min(
        (currentTime - lastTime) / (1000 / 60),
        2
      );
      lastTime = currentTime;

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

      frame = requestAnimationFrame(animate);
    };

    animate(lastTime);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(frame);
    };
  }, [effectiveVolume, center]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  const handleMouseDown = (e) => {
    e.preventDefault();

    isDragging.current = true;
    window.isGrabbing = true;

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
      window.isGrabbing = false;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () =>
      window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

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
          src="/logo/Jallogo.png"
          draggable={false}
          className={`logo-img ${hovered ? "fade-out" : "fade-in"}`}
          alt="Logo"
        />
        <img
          src="/logo/JallogoHover.png"
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