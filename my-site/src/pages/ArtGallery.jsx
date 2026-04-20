import { useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";

import Gallery from "../components/gallery/Gallery";
import useGalleryImages from "../components/gallery/useGalleryImages";

import "./ArtGallery.css";

export default function ArtGallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState(null);
  const [finalImagePosition, setFinalImagePosition] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  useEffect(() => {
    document.title = "Jallomoth — Art Gallery";
  }, []);

  // Animate modal image to final position when opening (layout-based)
  const getFinalRect = () => {
    if (finalImagePosition) return finalImagePosition;
    return {
      top: window.innerHeight * 0.1,
      left: window.innerWidth * 0.1,
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.8,
    };
  };

  const { images, grouped } = useGalleryImages(
    {
      "hall of fame": "Hall of Fame",
      "fools errand": "Fool's Errand",
      "fool's errand": "Fool's Errand",
    },
    {
      "Hall of Fame": 0,
      "Fool's Errand": 2,
    }
  );

  // Refs to thumbnail elements so keyboard navigation can position animations
  const itemRefs = useRef([]);

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

    // Animate image back to original position (layout properties)
    const modalImage = document.querySelector(".modal-image");
    if (modalImage && imagePosition) {
      modalImage.style.top = `${imagePosition.top}px`;
      modalImage.style.left = `${imagePosition.left}px`;
      modalImage.style.width = `${imagePosition.width}px`;
      modalImage.style.height = `${imagePosition.height}px`;
    }

    // Delay removing the `open` class slightly to avoid race conditions
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

  // Animate modal image to final position when opening (layout-based)
  useEffect(() => {
    if (isModalOpen && finalImagePosition) {
      const modalImage = document.querySelector(".modal-image");
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
  }, [isModalOpen, selectedIndex, grouped, imagePosition, finalImagePosition]);

  return (
    <>
      <Logo top="1vw" left="50%" width="35vw" center />
      <BackButton />

      <Gallery
        groupedImages={grouped}
        images={images}
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
              className="modal-image"
              src={selectedImage.src}
              alt={selectedImage.label}
              style={{
                top: `${imagePosition?.top ?? (finalImagePosition?.top ?? (window.innerHeight * 0.1))}px`,
                left: `${imagePosition?.left ?? (finalImagePosition?.left ?? (window.innerWidth * 0.1))}px`,
                width: `${imagePosition?.width ?? (finalImagePosition?.width ?? (window.innerWidth * 0.8))}px`,
                height: `${imagePosition?.height ?? (finalImagePosition?.height ?? (window.innerHeight * 0.8))}px`,
              }}
            />
          )}
          <button
            className="close-button"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseModal();
            }}
          >
            <img className="close-icon default" src="/x/x.png" alt="close" />
            <img className="close-icon hover" src="/x/x-hover.png" alt="close" />
            <img className="close-icon press" src="/x/x-press.png" alt="close" />
          </button>
        </div>
      )}
    </>
  );
}