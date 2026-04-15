import { useState, useRef, useEffect } from "react";
import "./Logo.css";

export default function Logo() {
  const [hovered, setHovered] = useState(false);

  const containerRef = useRef(null);

  const isDragging = useRef(false);

  const mouse = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const pos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // 👇 DIRECT follow (no smoothing → no shake)
      pos.current.x = mouse.current.x - dragOffset.current.x;
      pos.current.y = mouse.current.y - dragOffset.current.y;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    let frame;

    const animate = () => {
      if (!isDragging.current) {
        // SPRING BACK (elastic snap)
        const spring = 0.08;
        const damping = 0.8;

        velocity.current.x += (0 - pos.current.x) * spring;
        velocity.current.y += (0 - pos.current.y) * spring;

        velocity.current.x *= damping;
        velocity.current.y *= damping;

        pos.current.x += velocity.current.x;
        pos.current.y += velocity.current.y;
      } else {
        // reset velocity while dragging (prevents shake)
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
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();

    isDragging.current = true;

    // correct grab offset (fixes jumping)
    dragOffset.current.x = e.clientX - pos.current.x;
    dragOffset.current.y = e.clientY - pos.current.y;

    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  return (
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
        className={`logo-img logo-hover ${hovered ? "fade-in" : "fade-out"}`}
        alt="Logo Hover"
      />
    </div>
  );
}