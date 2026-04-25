import { useEffect, useRef, useState } from "react";
import "./GalleryItem.css";

export default function GalleryItem({
  img,
  index,
  itemRef,
  onClick,
  isSelected,
  isModalOpen,
  isModalClosing,
}) {
  const localRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Create a combined ref that sets both the callback ref and local ref
  const combinedRef = (el) => {
    localRef.current = el;
    if (itemRef) itemRef(el);
  };

  // Animate in when scrolled into view; unobserve afterwards (fire-once)
  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    const el = localRef.current;
    if (!el) return;

    const inner = el.querySelector(".tilt-inner");
    if (!inner) return;

    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 8;

    inner.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.05)
    `;
  };

  const handleLeave = () => {
    const el = localRef.current;
    if (!el) return;

    const inner = el.querySelector(".tilt-inner");
    if (!inner) return;

    inner.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  return (
    <div
      ref={combinedRef}
      className={`gallery-item ${isVisible ? "show" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
    >
      <div className="tilt-outer">
        <div className="tilt-inner">
          <img
            src={img.src}
            alt={img.label}
            draggable="false"
            loading="lazy"
            className={imageLoaded ? 'loaded' : ''}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            onClick={onClick}
            style={{
              // Hide immediately when selected (no fade) so the modal image
              // appears to be the same physical image.
              opacity: (isSelected && (isModalOpen || isModalClosing)) ? 0 : 1,
              transition: 'none'
            }}
          />
        </div>
      </div>

      <p>{img.label}</p>
    </div>
  );
}