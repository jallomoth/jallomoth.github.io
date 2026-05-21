// Jalloseum subpage — shows a scrollable image grid for one art category.
// Clicking a thumbnail opens a fullscreen modal with an expand animation
// that originates from the thumbnail's position. Supports keyboard
// navigation (arrow keys), touch swipe, and pinch-to-zoom inside the modal.
import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import ErrorBoundary from "../components/ErrorBoundary";
import JalloseumGallery from "../components/gallery/JalloseumGallery";
import useJalloseumImages from "../components/gallery/useJalloseumImages";
import usePageTitle from "../hooks/usePageTitle";
import { useDrag } from "../contexts/DragContext";

import "./Jalloseum.css";

export default function JalloseumSubpage({ subfolder, title }) {
  // --- MODAL STATE ---
  // imagePosition: thumbnail rect at the moment of click (animation start).
  // finalImagePosition: 80% of the viewport (animation end).
  // isModalClosing: true during the closing animation so the overlay stays
  // mounted until the transition finishes.
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState(null);
  const [finalImagePosition, setFinalImagePosition] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [closeState, setCloseState] = useState("normal");

  usePageTitle("Jallomoth — Jalloseum");

  const images = useJalloseumImages(subfolder);

  const itemRefs = useRef([]);
  const modalImageRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const modalOverlayRef = useRef(null);

  const { isGrabbingRef } = useDrag();

  // --- ZOOM STATE ---
  // Stored in refs (not state) to avoid triggering re-renders on every touch
  // event. Written directly to the DOM node via applyZoomTransform.
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
    modalImageRef.current.style.transformOrigin = "center center";
    modalImageRef.current.style.transform =
      s === 1 ? "" : `scale(${s}) translate(${x / s}px, ${y / s}px)`;
    modalImageRef.current.style.cursor = s > 1 ? (isDraggingRef.current ? 'grabbing' : 'grab') : '';
  }, []);

  // Reset zoom on every image change and on modal close.
  const resetZoom = useCallback(() => {
    zoomScaleRef.current = 1;
    zoomOffsetRef.current = { x: 0, y: 0 };
    if (modalImageRef.current) {
      modalImageRef.current.style.transform = "";
      modalImageRef.current.style.transformOrigin = "";
      modalImageRef.current.style.cursor = '';
    }
  }, []);

  // Start a mouse drag on the image (only when zoomed in, only on the image itself).
  const handleImageMouseDown = useCallback((e) => {
    if (e.button !== 0 || zoomScaleRef.current <= 1) return;
    const imgEl = e.currentTarget;
    const elRect = imgEl.getBoundingClientRect();
    const nW = imgEl.naturalWidth;
    const nH = imgEl.naturalHeight;
    if (nW && nH) {
      const s = Math.min(elRect.width / nW, elRect.height / nH);
      const rW = nW * s;
      const rH = nH * s;
      const left = elRect.left + (elRect.width  - rW) / 2;
      const top  = elRect.top  + (elRect.height - rH) / 2;
      if (e.clientX < left || e.clientX > left + rW ||
          e.clientY < top  || e.clientY > top  + rH) return;
    }
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
    isGrabbingRef.current = true;
    if (modalImageRef.current) modalImageRef.current.style.cursor = 'grabbing';
  }, [isGrabbingRef]);

  // --- MODAL OPEN ---
  // Records the thumbnail's current DOMRect as the animation start position.
  const handleImageClick = (img, index, rect) => {
    previousFocusRef.current = document.activeElement;
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

  // --- MODAL CLOSE ---
  const handleCloseModal = () => {
    setIsModalClosing(true);
    const modalImage = modalImageRef.current;
    if (modalImage && imagePosition) {
      modalImage.style.top = `${imagePosition.top}px`;
      modalImage.style.left = `${imagePosition.left}px`;
      modalImage.style.width = `${imagePosition.width}px`;
      modalImage.style.height = `${imagePosition.height}px`;
    }
    setTimeout(() => setIsModalOpen(false), 20);
    setTimeout(() => {
      setSelectedImage(null);
      setImagePosition(null);
      setFinalImagePosition(null);
      setSelectedIndex(null);
      setIsModalClosing(false);
      previousFocusRef.current?.focus();
    }, 650);
  };

  // Animate modal image to final position when opening
  useEffect(() => {
    if (isModalOpen && finalImagePosition) {
      const modalImage = modalImageRef.current;
      if (modalImage) {
        void modalImage.offsetWidth;
        modalImage.style.top = `${finalImagePosition.top}px`;
        modalImage.style.left = `${finalImagePosition.left}px`;
        modalImage.style.width = `${finalImagePosition.width}px`;
        modalImage.style.height = `${finalImagePosition.height}px`;
      }
    }
  }, [isModalOpen, finalImagePosition]);

  // Animate modal image when selectedImage changes while modal is already open
  useEffect(() => {
    if (!isModalOpen || !selectedImage || !finalImagePosition) return;
    const modalImage = modalImageRef.current;
    if (!modalImage) return;
    if (imagePosition) {
      modalImage.style.top = `${imagePosition.top}px`;
      modalImage.style.left = `${imagePosition.left}px`;
      modalImage.style.width = `${imagePosition.width}px`;
      modalImage.style.height = `${imagePosition.height}px`;
      void modalImage.offsetWidth;
    }
    modalImage.style.top = `${finalImagePosition.top}px`;
    modalImage.style.left = `${finalImagePosition.left}px`;
    modalImage.style.width = `${finalImagePosition.width}px`;
    modalImage.style.height = `${finalImagePosition.height}px`;
  }, [selectedImage]);

  // --- KEYBOARD NAVIGATION ---
  // Arrow keys navigate between images while the modal is open.
  useEffect(() => {
    const onKey = (e) => {
      if (!isModalOpen) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      if (typeof selectedIndex !== "number") return;
      const count = images.length;
      let next = selectedIndex;
      if (e.key === "ArrowRight") next = (selectedIndex + 1) % count;
      if (e.key === "ArrowLeft") next = (selectedIndex - 1 + count) % count;
      const thumbEl = itemRefs.current?.[next]?.querySelector("img");
      const rect = thumbEl ? thumbEl.getBoundingClientRect() : null;
      if (rect) {
        setImagePosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      } else {
        setImagePosition(null);
      }
      setSelectedIndex(next);
      setSelectedImage(images[next]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, selectedIndex, images]);

  useEffect(() => {
    if (isModalOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isModalOpen]);

  useEffect(() => { resetZoom(); }, [selectedImage, resetZoom]);
  useEffect(() => { if (!isModalOpen) resetZoom(); }, [isModalOpen, resetZoom]);

  // --- TOUCH SWIPE + PINCH-TO-ZOOM ---
  // Registered with passive:false on touchmove so preventDefault() can block
  // the browser's native pinch-zoom while the modal is open.
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
        touchStartX = null;
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
        if (zoomScaleRef.current <= 1.05) resetZoom();
        return;
      }
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (zoomScaleRef.current > 1 || Math.abs(dx) < 50) return;
      const count = images.length;
      if (typeof selectedIndex !== "number") return;
      let nextIdx = selectedIndex;
      if (dx < 0) nextIdx = (selectedIndex + 1) % count;
      if (dx > 0) nextIdx = (selectedIndex - 1 + count) % count;
      const thumbEl = itemRefs.current?.[nextIdx]?.querySelector("img");
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
      setSelectedImage(images[nextIdx]);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [isModalOpen, selectedIndex, images, applyZoomTransform, resetZoom]);

  // Scroll-wheel zoom — desktop (hover+fine-pointer) devices only.
  useEffect(() => {
    const el = modalOverlayRef.current;
    if (!el || !isModalOpen) return;
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
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      hasDraggedRef.current = true;
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
      isGrabbingRef.current = false;
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
  }, [applyZoomTransform, isGrabbingRef]);

  // Tab trap: only one focusable element in the modal (close button),
  // so Tab simply keeps focus there rather than escaping to the background.
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
      <BackButton to="/jalloseum" />

      <main>
        <ErrorBoundary>
          <JalloseumGallery
            images={images}
            selectedIndex={selectedIndex}
            isModalOpen={isModalOpen}
            isModalClosing={isModalClosing}
            itemRefs={itemRefs}
            onImageClick={handleImageClick}
          />
        </ErrorBoundary>

        {/* DARK BLUR BACKDROP */}
        {(selectedImage || isModalClosing) && (
          <div
            className={`modal-backdrop ${isModalOpen ? "open" : ""} ${isModalClosing ? "closing" : ""}`}
          />
        )}

        {(selectedImage || isModalClosing) && (
          <div
            ref={modalOverlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            className={`modal-overlay ${isModalOpen ? "open" : ""} ${isModalClosing ? "closing" : ""}`}
            onClick={(e) => {
              if (hasDraggedRef.current) { hasDraggedRef.current = false; return; }
              if (zoomScaleRef.current > 1) return;
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
                  closeState === "press" ? "/buttons/x/x-press.png"
                  : closeState === "hover" ? "/buttons/x/x-hover.png"
                  : "/buttons/x/x.png"
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
