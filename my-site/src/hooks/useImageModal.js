// Encapsulates all modal state, refs, and interaction logic for the
// fullscreen image viewer used by ArtGallery, JalloseumSubpage, and
// Commissions. Accepts a flat ordered array of images (the navigation domain)
// and returns everything both the gallery render and <ImageModal> need.
import { useCallback, useEffect, useRef, useState } from "react";
import { useDrag } from "../contexts/DragContext";

export default function useImageModal(images) {
  // --- MODAL STATE ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState(null);
  const [finalImagePosition, setFinalImagePosition] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [closeState, setCloseState] = useState("normal");

  // --- REFS ---
  const itemRefs = useRef([]);
  const modalImageRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const modalOverlayRef = useRef(null);

  const { isGrabbingRef } = useDrag();

  // --- ZOOM STATE (refs to avoid re-renders on every touch/wheel event) ---
  const zoomScaleRef = useRef(1);
  const zoomOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const applyZoomTransform = useCallback(() => {
    if (!modalImageRef.current) return;
    const s = zoomScaleRef.current;
    const { x, y } = zoomOffsetRef.current;
    modalImageRef.current.style.transformOrigin = "center center";
    modalImageRef.current.style.transform =
      s === 1 ? "" : `scale(${s}) translate(${x / s}px, ${y / s}px)`;
    modalImageRef.current.style.cursor =
      s > 1 ? (isDraggingRef.current ? "grabbing" : "grab") : "";
  }, []);

  const resetZoom = useCallback(() => {
    zoomScaleRef.current = 1;
    zoomOffsetRef.current = { x: 0, y: 0 };
    if (modalImageRef.current) {
      modalImageRef.current.style.transform = "";
      modalImageRef.current.style.transformOrigin = "";
      modalImageRef.current.style.cursor = "";
    }
  }, []);

  // Restrict drag start to the actual rendered image pixels (not letterbox area).
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
      const left = elRect.left + (elRect.width - rW) / 2;
      const top = elRect.top + (elRect.height - rH) / 2;
      if (
        e.clientX < left || e.clientX > left + rW ||
        e.clientY < top  || e.clientY > top  + rH
      ) return;
    }
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
    isGrabbingRef.current = true;
    if (modalImageRef.current) modalImageRef.current.style.cursor = "grabbing";
  }, [isGrabbingRef]);

  // --- MODAL OPEN ---
  // rect can be a DOMRect or a plain { top, left, width, height } object.
  const handleImageClick = (img, index, rect) => {
    previousFocusRef.current = document.activeElement;
    setImagePosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
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

  // Convenience wrapper: looks up the rect from itemRefs internally.
  // Use this when the gallery child doesn't supply a rect.
  const handleThumbClick = (img, index) => {
    const el = itemRefs.current[index]?.querySelector("img");
    if (!el) return;
    handleImageClick(img, index, el.getBoundingClientRect());
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

  // Animate image to final position when the modal opens.
  useEffect(() => {
    if (isModalOpen && finalImagePosition) {
      const modalImage = modalImageRef.current;
      if (modalImage) {
        void modalImage.offsetWidth; // force reflow to trigger animation
        modalImage.style.top = `${finalImagePosition.top}px`;
        modalImage.style.left = `${finalImagePosition.left}px`;
        modalImage.style.width = `${finalImagePosition.width}px`;
        modalImage.style.height = `${finalImagePosition.height}px`;
      }
    }
  }, [isModalOpen, finalImagePosition]);

  // Re-animate when navigating while the modal is already open.
  // imagePosition and finalImagePosition are intentionally excluded from deps
  // so this only fires on selectedImage changes, not on every position update.
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage]);

  // --- KEYBOARD NAVIGATION ---
  useEffect(() => {
    const onKey = (e) => {
      if (!isModalOpen) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      if (typeof selectedIndex !== "number") return;
      const count = images.length;
      let next = selectedIndex;
      if (e.key === "ArrowRight") next = (selectedIndex + 1) % count;
      if (e.key === "ArrowLeft")  next = (selectedIndex - 1 + count) % count;
      const thumbEl = itemRefs.current?.[next]?.querySelector("img");
      const rect = thumbEl ? thumbEl.getBoundingClientRect() : null;
      if (rect) setImagePosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      else setImagePosition(null);
      setSelectedIndex(next);
      setSelectedImage(images[next]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, selectedIndex, images]);

  // Move focus to the close button when the modal opens.
  useEffect(() => {
    if (isModalOpen && closeButtonRef.current) closeButtonRef.current.focus();
  }, [isModalOpen]);

  useEffect(() => { resetZoom(); }, [selectedImage, resetZoom]);
  useEffect(() => { if (!isModalOpen) resetZoom(); }, [isModalOpen, resetZoom]);

  // --- TOUCH SWIPE + PINCH-TO-ZOOM ---
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
        zoomOffsetRef.current = { x: zoomOffsetRef.current.x + dx, y: zoomOffsetRef.current.y + dy };
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
      if (rect) setImagePosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      else setImagePosition(null);
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

  // --- SCROLL-WHEEL ZOOM (desktop only) ---
  useEffect(() => {
    const el = modalOverlayRef.current;
    if (!el || !isModalOpen) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onWheel = (e) => {
      e.preventDefault();
      const oldScale = zoomScaleRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newScale = Math.max(1, Math.min(4, oldScale * factor));
      if (newScale === 1) { resetZoom(); return; }
      const imgEl = modalImageRef.current;
      if (!imgEl) return;
      const cx = imgEl.offsetLeft + imgEl.offsetWidth / 2;
      const cy = imgEl.offsetTop + imgEl.offsetHeight / 2;
      const ratio = newScale / oldScale;
      const { x, y } = zoomOffsetRef.current;
      zoomOffsetRef.current = {
        x: (e.clientX - cx) * (1 - ratio) + x * ratio,
        y: (e.clientY - cy) * (1 - ratio) + y * ratio,
      };
      zoomScaleRef.current = newScale;
      applyZoomTransform();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isModalOpen, applyZoomTransform, resetZoom]);

  // --- MOUSE DRAG TO PAN (desktop) ---
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      hasDraggedRef.current = true;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      zoomOffsetRef.current = { x: zoomOffsetRef.current.x + dx, y: zoomOffsetRef.current.y + dy };
      applyZoomTransform();
    };
    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      isGrabbingRef.current = false;
      requestAnimationFrame(() => { hasDraggedRef.current = false; });
      if (modalImageRef.current && zoomScaleRef.current > 1) {
        modalImageRef.current.style.cursor = "grab";
      }
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [applyZoomTransform, isGrabbingRef]);

  // Tab trap + Escape key handler for the modal overlay.
  const handleModalKeyDown = (e) => {
    if (e.key === "Tab") { e.preventDefault(); closeButtonRef.current?.focus(); }
    if (e.key === "Escape") handleCloseModal();
  };

  return {
    selectedImage,
    selectedIndex,
    imagePosition,
    isModalOpen,
    isModalClosing,
    closeState,
    setCloseState,
    itemRefs,
    modalImageRef,
    closeButtonRef,
    modalOverlayRef,
    hasDraggedRef,
    zoomScaleRef,
    handleImageClick,
    handleThumbClick,
    handleCloseModal,
    handleImageMouseDown,
    handleModalKeyDown,
  };
}
