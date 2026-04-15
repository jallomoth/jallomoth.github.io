import { useState, useRef, useEffect } from "react";
import { useAudio } from "./AudioContext";
import "./Logo.css";

export default function Logo() {
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

  // preload sound
  useEffect(() => {
    const audio = new Audio("/sounds/snap.mp3");
    audio.volume = effectiveVolume;
    soundRef.current = audio;
  }, []);

  // drag + physics + snap
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

        // release grab cursor globally
        window.isGrabbing = false;

        const distance = Math.sqrt(
          pos.current.x * pos.current.x +
          pos.current.y * pos.current.y
        );

        const THRESHOLD = 500;

        if (distance > THRESHOLD && soundRef.current) {
          const strength = Math.min(distance / 300, 1);

          // combine global volume + intensity
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

    const animate = () => {
      if (!isDragging.current) {
        const spring = 0.08;
        const damping = 0.8;

        velocity.current.x += (0 - pos.current.x) * spring;
        velocity.current.y += (0 - pos.current.y) * spring;

        velocity.current.x *= damping;
        velocity.current.y *= damping;

        pos.current.x += velocity.current.x;
        pos.current.y += velocity.current.y;
      } else {
        velocity.current.x = 0;
        velocity.current.y = 0;
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `
          translate(-50%, -50%)
          translate(${pos.current.x}px, ${pos.current.y}px)
        `;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(frame);
    };
  }, [effectiveVolume]);

  // keep sound volume in sync with slider
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  // mouse down (start drag + effects)
  const handleMouseDown = (e) => {
    e.preventDefault();

    isDragging.current = true;

    // enable grab cursor
    window.isGrabbing = true;

    dragOffset.current.x = e.clientX - pos.current.x;
    dragOffset.current.y = e.clientY - pos.current.y;

    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;

    // spawn click effect
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

  // prevent stuck grab if mouse released outside
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      window.isGrabbing = false;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="logo-container"
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

      {/* click effects */}
      {effects.map((effect) => (
        <img
          key={effect.id}
          src="/logo/popup.png"
          className="click-effect"
          style={{
            left: effect.x,
            top: effect.y,
          }}
          alt=""
        />
      ))}
    </>
  );
}