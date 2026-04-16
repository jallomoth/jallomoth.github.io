import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NavButton.css";

export default function NavButton({ image, hoverImage, to, alt, label }) {
  const [hovered, setHovered] = useState(false);
  const [draggingState, setDraggingState] = useState(false);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  const isDragging = useRef(false);

  const mouse = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const pos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  const isExternal = /^https?:\/\//.test(to) || to?.startsWith("//");
  const isActive = hovered || draggingState;
  const src = isActive && hoverImage ? hoverImage : image;
  const altText = alt || label || "Navigation button";

  // threshold
  const DRAG_THRESHOLD = 80;

  const navigateTo = () => {
    if (isExternal) {
      window.location.assign(to);
    } else {
      navigate(to);
    }
  };

  // -----------------------------
  // DRAG + SPRING + MAGNETIC
  // -----------------------------
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!isDragging.current) return;

      pos.current.x = mouse.current.x - dragOffset.current.x;
      pos.current.y = mouse.current.y - dragOffset.current.y;

      window.draggedButtonPos = {
        x: mouse.current.x,
        y: mouse.current.y,
      };
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setDraggingState(false);

        window.isGrabbing = false;
        window.isDraggingButton = false;
        window.draggedButtonPos = null;

        setHovered(false);

        // -----------------------------
        // DISTANCE CHECK
        // -----------------------------
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

      if (!isDragging.current && window.draggedButtonPos) {
        const rect = containerRef.current.getBoundingClientRect();

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = cx - window.draggedButtonPos.x;
        const dy = cy - window.draggedButtonPos.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        const RADIUS = 350;

        if (dist < RADIUS) {
          const force = (RADIUS - dist) / RADIUS;

          pos.current.x += (dx / dist) * force * 20;
          pos.current.y += (dy / dist) * force * 20;
        }
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `
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
  }, [navigate, to]);

  // -----------------------------
  // START DRAG
  // -----------------------------
  const handleMouseDown = (e) => {
    e.preventDefault();

    isDragging.current = true;
    setDraggingState(true);

    window.isGrabbing = true;
    window.isDraggingButton = true;

    dragOffset.current.x = e.clientX - pos.current.x;
    dragOffset.current.y = e.clientY - pos.current.y;

    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  // -----------------------------
  // HOVER CONTROL
  // -----------------------------
  const handleEnter = () => {
    if (!window.isDraggingButton) setHovered(true);
  };

  const handleLeave = () => {
    if (!window.isDraggingButton) setHovered(false);
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
      onMouseDown={handleMouseDown}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onKeyDown={handleKeyDown}
    >
      <div className={`nav-button ${isActive ? "active-button" : ""}`}>
        <img
          src={src}
          className="nav-button-image"
          alt={altText}
          draggable="false"
        />
      </div>
    </div>
  );
}