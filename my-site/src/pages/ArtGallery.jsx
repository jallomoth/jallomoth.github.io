import { useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";

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

  const handleImageClick = (img, index, rect) => {
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

  return (
    <>
      <Logo top="1vw" left="50%" width="35vw" center />
      <BackButton />

      <Gallery
        groupedImages={grouped}
        selectedIndex={selectedIndex}
        isModalOpen={isModalOpen}
        isModalClosing={isModalClosing}
        itemRefs={itemRefs}
        onImageClick={handleImageClick}
      />

      {/* MODAL OVERLAY */}
      {(selectedImage || isModalClosing) && (
        <div
          className={`modal-overlay ${isModalOpen ? "open" : ""} ${isModalClosing ? "closing" : ""}`}
          onClick={handleCloseModal}
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
    </>
  );
}