// Art Gallery page — shows fan-submitted artwork grouped by year and category.
// Clicking a thumbnail opens a fullscreen modal with an expand animation.
// Supports keyboard navigation, touch swipe, and pinch-to-zoom in the modal.
import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import ErrorBoundary from "../components/ErrorBoundary";

import Gallery from "../components/gallery/Gallery";
import useGalleryImages from "../components/gallery/useGalleryImages";
import usePageTitle from "../hooks/usePageTitle";
import { useDrag } from "../contexts/DragContext";

import "./ArtGallery.css";

// Normalize special folder names to their display-label equivalents.
// Keys are lowercased folder names; values are the canonical display labels.
const SECTION_MAP = {
  "hall of fame": "Hall of Fame",
  "fools errand": "Fool's Errand",
  "fool's errand": "Fool's Errand",
};

// Defines the sort position of named sections. Unlisted sections sort to
// priority 1, which places them between Hall of Fame (0) and Fool's Errand (2).
const SORT_ORDER = {
  "Hall of Fame": 0,
  "Fool's Errand": 2,
};

export default function ArtGallery() {
  // --- MODAL STATE ---
  // imagePosition: thumbnail rect at click time (animation start).
  // finalImagePosition: 80% of the viewport (animation end).
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

  const modalOverlayRef = useRef(null);

  const { isGrabbingRef } = useDrag();

  // --- ZOOM STATE ---
  // Refs rather than state so touch events can update them without
  // causing re-renders; written directly to the DOM via applyZoomTransform.
  const zoomScaleRef = useRef(1);
  const zoomOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // Apply current zoom/pan transform to the modal image DOM node.
  const applyZoomTransform = useCallback(() => {
    if (!modalImageRef.current) return;
    const s = zoomScaleRef.current;
    const { x, y } = zoomOffsetRef.current;
    modalImageRef.current.style.transformOrigin = 'center center';
    modalImageRef.current.style.transform =
      s === 1 ? '' : `scale(${s}) translate(${x / s}px, ${y / s}px)`;
    modalImageRef.current.style.cursor = s > 1 ? (isDraggingRef.current ? 'grabbing' : 'grab') : '';
  }, []);

  // Reset zoom on every image change and on modal close.
  const resetZoom = useCallback(() => {
    zoomScaleRef.current = 1;
    zoomOffsetRef.current = { x: 0, y: 0 };
    if (modalImageRef.current) {
      modalImageRef.current.style.transform = '';
      modalImageRef.current.style.transformOrigin = '';
      modalImageRef.current.style.cursor = '';
    }
  }, []);

  // Start a mouse drag on the image (only when zoomed in, only on the image itself).
  const handleImageMouseDown = useCallback((e) => {
    if (e.button !== 0 || zoomScaleRef.current <= 1) return;

    // Restrict drag start to the actual rendered image pixels, not the
    // letterbox area produced by object-fit: contain.
    const imgEl = e.currentTarget;
    const elRect = imgEl.getBoundingClientRect();
    const nW = imgEl.naturalWidth;
    const nH = imgEl.naturalHeight;
    if (nW && nH) {
      const s = Math.min(elRect.width / nW, elRect.height / nH);
      const rW = nW * s;
      const rH = nH * s;
      const left   = elRect.left + (elRect.width  - rW) / 2;
      const top    = elRect.top  + (elRect.height - rH) / 2;
      if (e.clientX < left || e.clientX > left + rW ||
          e.clientY < top  || e.clientY > top  + rH) return;
    }

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    e.preventDefault(); // prevent browser text/image drag
    isGrabbingRef.current = true; // switch custom cursor to grab image
    if (modalImageRef.current) modalImageRef.current.style.cursor = 'grabbing';
  }, [isGrabbingRef]);

  // --- MODAL OPEN ---
  // Records the thumbnail's DOMRect as the animation start position.
  const handleImageClick = (img, index, rect) => {
    previousFocusRef.current = document.activeElement;
    // Convert DOMRect to a plain object (DOMRect properties are non-enumerable)
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

  // Scroll-wheel zoom — desktop (hover+fine-pointer) devices only.
  // Zooms in/out by 10% per tick; minimum scale is 1 (original open size).
  useEffect(() => {
    const el = modalOverlayRef.current;
    if (!el || !isModalOpen) return;

    // Skip on touch-only devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const onWheel = (e) => {
      e.preventDefault();
      const oldScale = zoomScaleRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newScale = Math.max(1, Math.min(4, oldScale * factor));
      if (newScale === 1) {
        resetZoom();
        return;
      }
      const imgEl = modalImageRef.current;
      if (!imgEl) return;
      // Untransformed element center in viewport (offsetLeft/Top are layout values,
      // unaffected by CSS transform, giving the pre-transform position).
      const cx = imgEl.offsetLeft + imgEl.offsetWidth  / 2;
      const cy = imgEl.offsetTop  + imgEl.offsetHeight / 2;
      // Adjust pan offset so the viewport point under the cursor stays fixed.
      const ratio = newScale / oldScale;
      const { x, y } = zoomOffsetRef.current;
      zoomOffsetRef.current = {
        x: (e.clientX - cx) * (1 - ratio) + x * ratio,
        y: (e.clientY - cy) * (1 - ratio) + y * ratio,
      };
      zoomScaleRef.current = newScale;
      applyZoomTransform();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isModalOpen, applyZoomTransform, resetZoom]);

  // Mouse drag to pan when zoomed in (desktop only).
  // Attached to the document so dragging outside the image keeps working.
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      hasDraggedRef.current = true; // mark that real movement occurred
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      zoomOffsetRef.current = {
        x: zoomOffsetRef.current.x + dx,
        y: zoomOffsetRef.current.y + dy,
      };
      applyZoomTransform();
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      isGrabbingRef.current = false; // restore custom cursor
      // Defer the hasDragged reset so the click event (if any) fires first
      requestAnimationFrame(() => { hasDraggedRef.current = false; });
      if (modalImageRef.current && zoomScaleRef.current > 1) {
        modalImageRef.current.style.cursor = 'grab';
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [applyZoomTransform]);

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

      {/* DARK BLUR BACKDROP — separate element so the closing mask on
           .modal-overlay doesn't clip the blur; it fades out uniformly */}
      {(selectedImage || isModalClosing) && (
        <div
          className={`modal-backdrop ${isModalOpen ? "open" : ""} ${isModalClosing ? "closing" : ""}`}
        />
      )}

      {/* MODAL OVERLAY */}
      {(selectedImage || isModalClosing) && (
        <div
          ref={modalOverlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className={`modal-overlay ${isModalOpen ? "open" : ""} ${isModalClosing ? "closing" : ""}`}
          onClick={(e) => {
            // If the user just finished dragging, swallow the stray click
            if (hasDraggedRef.current) {
              hasDraggedRef.current = false;
              return;
            }
            // When zoomed in don't close on overlay click — use X or Escape
            if (zoomScaleRef.current > 1) return;
            // Close only when clicking outside the actual rendered image pixels.
            // The element box is 80vw×80vh; object-fit:contain letterboxes the
            // image inside it, so we must compute the true content rect.
            const imgEl = modalImageRef.current;
            if (imgEl) {
              const elRect = imgEl.getBoundingClientRect();
              const nW = imgEl.naturalWidth;
              const nH = imgEl.naturalHeight;
              let r = elRect;
              if (nW && nH) {
                const s = Math.min(elRect.width / nW, elRect.height / nH);
                const rW = nW * s;
                const rH = nH * s;
                r = {
                  left:   elRect.left + (elRect.width  - rW) / 2,
                  top:    elRect.top  + (elRect.height - rH) / 2,
                  right:  elRect.left + (elRect.width  + rW) / 2,
                  bottom: elRect.top  + (elRect.height + rH) / 2,
                };
              }
              if (e.clientX >= r.left && e.clientX <= r.right &&
                  e.clientY >= r.top  && e.clientY <= r.bottom) return;
            }
            handleCloseModal();
          }}
          onKeyDown={handleModalKeyDown}
        >
          {selectedImage && (
            <img
              ref={modalImageRef}
              className="modal-image"
              src={selectedImage.src}
              alt={selectedImage.label}
              draggable="false"
              onMouseDown={handleImageMouseDown}
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
                closeState === "press" ? "/buttons/x/X-select.png"
                : closeState === "hover" ? "/buttons/x/X-hover.png"
                : "/buttons/x/X.png"
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