import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import ErrorBoundary from "../components/ErrorBoundary";

import Gallery from "../components/gallery/Gallery";
import useGalleryImages from "../components/gallery/useGalleryImages";
import usePageTitle from "../hooks/usePageTitle";

import "./ArtGallery.css";

const SECTION_MAP = {
  "hall of fame": "Hall of Fame",
  "fools errand": "Fool's Errand",
  "fool's errand": "Fool's Errand",
};

const SORT_ORDER = {
  "Hall of Fame": 0,
  "Fool's Errand": 2,
};

export default function ArtGallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState(null);
  const [finalImagePosition, setFinalImagePosition] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [closeState, setCloseState] = useState("normal");

  usePageTitle("Jallomoth — Art Gallery");

  // Animate modal image to final position when opening
  useEffect(() => {
    if (isModalOpen && finalImagePosition) {
      const modalImage = modalImageRef.current;
      if (modalImage) {
        // Force a reflow to trigger the animation
        void modalImage.offsetWidth;
        
        modalImage.style.top = `${finalImagePosition.top}px`;
        modalImage.style.left = `${finalImagePosition.left}px`;
        modalImage.style.width = `${finalImagePosition.width}px`;
        modalImage.style.height = `${finalImagePosition.height}px`;
      }
    }
  }, [isModalOpen, finalImagePosition]);

  const { images, grouped } = useGalleryImages(SECTION_MAP, SORT_ORDER);

  // Refs to thumbnail elements so keyboard navigation can position animations
  const itemRefs = useRef([]);
  const modalImageRef = useRef(null);
  const closeButtonRef = useRef(null);
  // Tracks what had focus before the modal opened so we can restore it on close
  const previousFocusRef = useRef(null);

  // Modal overlay ref — needed for non-passive touchmove (pinch-to-zoom, NTH-6)
  const modalOverlayRef = useRef(null);
  // Pinch-to-zoom state (refs for perf — avoids re-renders on every touch event)
  const zoomScaleRef = useRef(1);
  const zoomOffsetRef = useRef({ x: 0, y: 0 });

  // Apply current zoom/pan transform directly to the modal image DOM node
  const applyZoomTransform = useCallback(() => {
    if (!modalImageRef.current) return;
    const s = zoomScaleRef.current;
    const { x, y } = zoomOffsetRef.current;
    modalImageRef.current.style.transformOrigin = 'center center';
    modalImageRef.current.style.transform =
      s === 1 ? '' : `scale(${s}) translate(${x / s}px, ${y / s}px)`;
  }, []);

  // Reset zoom on every image navigation and on modal close
  const resetZoom = useCallback(() => {
    zoomScaleRef.current = 1;
    zoomOffsetRef.current = { x: 0, y: 0 };
    if (modalImageRef.current) {
      modalImageRef.current.style.transform = '';
      modalImageRef.current.style.transformOrigin = '';
    }
  }, []);

  const handleImageClick = (img, index, rect) => {
    previousFocusRef.current = document.activeElement;
    // Convert DOMRect to plain object with the values we need
    setImagePosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setFinalImagePosition({
      top: window.innerHeight * 0.1,
      left: window.innerWidth * 0.1,
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.8,
    });

    setSelectedImage(img);
    setSelectedIndex(index);

    setTimeout(() => setIsModalOpen(true), 10);
  };

  const handleCloseModal = () => {
    // Mark closing state so UI stays rendered while animation runs
    setIsModalClosing(true);

    // Animate image back to original position
    const modalImage = modalImageRef.current;
    if (modalImage && imagePosition) {
      modalImage.style.top = `${imagePosition.top}px`;
      modalImage.style.left = `${imagePosition.left}px`;
      modalImage.style.width = `${imagePosition.width}px`;
      modalImage.style.height = `${imagePosition.height}px`;
    }

    // Delay removing the `open` class slightly to avoid race conditions
    // where React updates could remove the class before the closing flag
    // is applied, causing the overlay to disappear instantly.
    setTimeout(() => setIsModalOpen(false), 20);

    // Remove modal after animation completes (allow overlay + image to finish)
    setTimeout(() => {
      setSelectedImage(null);
      setImagePosition(null);
      setFinalImagePosition(null);
      setSelectedIndex(null);
      setIsModalClosing(false);
      previousFocusRef.current?.focus();
    }, 650); // Allow 600ms CSS transition + small buffer
  };

  // Animate modal image when selectedImage changes while modal is already open
  useEffect(() => {
    if (!isModalOpen || !selectedImage || !finalImagePosition) return;

    const modalImage = modalImageRef.current;
    if (!modalImage) return;

    // If we have a source thumbnail position, start the modal image there
    if (imagePosition) {
      modalImage.style.top = `${imagePosition.top}px`;
      modalImage.style.left = `${imagePosition.left}px`;
      modalImage.style.width = `${imagePosition.width}px`;
      modalImage.style.height = `${imagePosition.height}px`;
      // force reflow
      void modalImage.offsetWidth;
    }

    // animate to final position
    modalImage.style.top = `${finalImagePosition.top}px`;
    modalImage.style.left = `${finalImagePosition.left}px`;
    modalImage.style.width = `${finalImagePosition.width}px`;
    modalImage.style.height = `${finalImagePosition.height}px`;
  }, [selectedImage]);

  // Keyboard navigation while modal is open
  useEffect(() => {
    const onKey = (e) => {
      if (!isModalOpen) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();

      if (typeof selectedIndex !== "number") return;
      // Build a flat list matching the UI ordering (grouped sections order)
      const flatOrder = grouped.flatMap(([, imgs]) => imgs);
      const count = flatOrder.length;
      let next = selectedIndex;
      if (e.key === "ArrowRight") next = (selectedIndex + 1) % count;
      if (e.key === "ArrowLeft") next = (selectedIndex - 1 + count) % count;

      // compute thumbnail rect if available
      const thumbEl = itemRefs.current?.[next]?.querySelector("img");
      const rect = thumbEl ? thumbEl.getBoundingClientRect() : null;

      if (rect) {
        setImagePosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      } else {
        setImagePosition(null);
      }

      setSelectedIndex(next);
      setSelectedImage(flatOrder[next]);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, selectedIndex, grouped]);

  // Move focus into the modal when it opens; the close button is the only
  // interactive element so it always receives focus.
  useEffect(() => {
    if (isModalOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isModalOpen]);

  // Reset zoom when the selected image changes (swipe navigation)
  useEffect(() => { resetZoom(); }, [selectedImage, resetZoom]);

  // Reset zoom when the modal closes
  useEffect(() => { if (!isModalOpen) resetZoom(); }, [isModalOpen, resetZoom]);

  // Touch swipe (NTH-5) + pinch-to-zoom (NTH-6) on modal overlay.
  // Uses passive:false on touchmove so we can call preventDefault() to
  // block the browser's own pinch-zoom while the modal is open.
  useEffect(() => {
    const el = modalOverlayRef.current;
    if (!el || !isModalOpen) return;

    let touchStartX = null;
    let touchStartY = null;
    let pinchDist = null;

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDist = Math.sqrt(dx * dx + dy * dy);
        touchStartX = null; // cancel any in-progress swipe
      } else if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        pinchDist = null;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinchDist !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        zoomScaleRef.current = Math.max(1, Math.min(4, zoomScaleRef.current * (dist / pinchDist)));
        pinchDist = dist;
        applyZoomTransform();
      } else if (e.touches.length === 1 && touchStartX !== null && zoomScaleRef.current > 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        zoomOffsetRef.current = {
          x: zoomOffsetRef.current.x + dx,
          y: zoomOffsetRef.current.y + dy,
        };
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        applyZoomTransform();
      }
    };

    const onTouchEnd = (e) => {
      if (pinchDist !== null) {
        pinchDist = null;
        // Snap back to 1× if the user barely pinched
        if (zoomScaleRef.current <= 1.05) resetZoom();
        return;
      }
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;

      // Only swipe-navigate when not zoomed in
      if (zoomScaleRef.current > 1 || Math.abs(dx) < 50) return;

      const flatOrder = grouped.flatMap(([, imgs]) => imgs);
      const count = flatOrder.length;
      if (typeof selectedIndex !== 'number') return;

      let nextIdx = selectedIndex;
      if (dx < 0) nextIdx = (selectedIndex + 1) % count;
      if (dx > 0) nextIdx = (selectedIndex - 1 + count) % count;

      const thumbEl = itemRefs.current?.[nextIdx]?.querySelector('img');
      const rect = thumbEl ? thumbEl.getBoundingClientRect() : null;
      if (rect) {
        setImagePosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      } else {
        setImagePosition(null);
      }
      setFinalImagePosition({
        top: window.innerHeight * 0.1,
        left: window.innerWidth * 0.1,
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
      });
      setSelectedIndex(nextIdx);
      setSelectedImage(flatOrder[nextIdx]);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [isModalOpen, selectedIndex, grouped, applyZoomTransform, resetZoom]);

  // Tab-key trap: keep focus locked inside the modal while it is open.
  // Only one focusable element exists (the close button), so Tab simply
  // stays on it rather than escaping to background content.
  const handleModalKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      closeButtonRef.current?.focus();
    }
    if (e.key === "Escape") {
      handleCloseModal();
    }
  };

  return (
    <>
      <Logo top="20px" left="50%" width="35vw" center />
      <BackButton />

      <main>
      <ErrorBoundary>
      <Gallery
        groupedImages={grouped}
        selectedIndex={selectedIndex}
        isModalOpen={isModalOpen}
        isModalClosing={isModalClosing}
        itemRefs={itemRefs}
        onImageClick={handleImageClick}
      />
      </ErrorBoundary>

      {/* MODAL OVERLAY */}
      {(selectedImage || isModalClosing) && (
        <div
          ref={modalOverlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className={`modal-overlay ${isModalOpen ? "open" : ""} ${isModalClosing ? "closing" : ""}`}
          onClick={handleCloseModal}
          onKeyDown={handleModalKeyDown}
        >
          {selectedImage && (
            <img
              ref={modalImageRef}
              className="modal-image"
              src={selectedImage.src}
              alt={selectedImage.label}
              style={{
                top: `${imagePosition?.top ?? 0}px`,
                left: `${imagePosition?.left ?? 0}px`,
                width: `${imagePosition?.width ?? 0}px`,
                height: `${imagePosition?.height ?? 0}px`,
              }}
            />
          )}
          <button
            ref={closeButtonRef}
            className="close-button"
            aria-label="Close"
            onMouseEnter={() => setCloseState("hover")}
            onMouseLeave={() => setCloseState("normal")}
            onMouseDown={() => setCloseState("press")}
            onMouseUp={() => setCloseState("hover")}
            onClick={(e) => {
              e.stopPropagation();
              handleCloseModal();
            }}
          >
            <img
              className="close-icon"
              src={
                closeState === "press" ? "/x/x-press.png"
                : closeState === "hover" ? "/x/x-hover.png"
                : "/x/x.png"
              }
              alt=""
            />
          </button>
        </div>
      )}
      </main>
    </>
  );
}