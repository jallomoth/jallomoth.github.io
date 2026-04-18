import { useEffect, useRef, useState } from "react";
import "../App.css";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import "./ArtGallery.css";

/* -----------------------------
   ORDER
----------------------------- */
const IMAGE_ORDER = [
  "G4vj9YFWgAAUlRO",
  "apesin",
  "apesrt",
  "apestl",
  "971572",
];

/* -----------------------------
   LOAD IMAGES
----------------------------- */
const imageModules = import.meta.glob(
  "../assets/gallery/**/*.{png,jpg,jpeg,webp,gif}",
  { eager: true }
);

const images = Object.entries(imageModules)
  .map(([path, mod]) => {
    const fileName = path.split("/").pop().split(".")[0];

    const label = fileName
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      src: mod.default,
      label,
      fileName,
    };
  })
  .sort((a, b) => {
    const aIndex = IMAGE_ORDER.indexOf(a.fileName);
    const bIndex = IMAGE_ORDER.indexOf(b.fileName);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.fileName.localeCompare(b.fileName);
  });

export default function ArtGallery() {
  const [visibleCount, setVisibleCount] = useState(0);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState(null);
  const [finalImagePosition, setFinalImagePosition] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemRefs = useRef([]);

  /* -----------------------------
     CASCADE LOAD
  ----------------------------- */
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= images.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  /* -----------------------------
     3D TILT
  ----------------------------- */
  const handleMouseMove = (e, index) => {
    const el = itemRefs.current[index];
    if (!el) return;

    const inner = el.querySelector(".tilt-inner");
    if (!inner) return;

    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = -((y - centerY) / centerY) * 8;

    inner.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.05)
    `;
  };

  const handleMouseLeave = (index) => {
    const el = itemRefs.current[index];
    if (!el) return;

    const inner = el.querySelector(".tilt-inner");
    if (!inner) return;

    inner.style.transform = `
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
  };

  /* -----------------------------
     CLICK IMAGE (SEAMLESS + GROW)
  ----------------------------- */
  const handleImageClick = (img, index) => {
    const imgElement = itemRefs.current[index]?.querySelector("img");
    if (!imgElement) return;

    // instant hide (prevents initial flicker)
    imgElement.style.opacity = "0";

    const rect = imgElement.getBoundingClientRect();

    const naturalWidth = imgElement.naturalWidth || rect.width;
    const naturalHeight = imgElement.naturalHeight || rect.height;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const maxWidth = viewportWidth * 0.9;
    const maxHeight = viewportHeight * 0.9;

    const aspectRatio = naturalWidth / naturalHeight;

    const SCALE_UP = 1.2;

    let targetWidth = naturalWidth * SCALE_UP;
    let targetHeight = naturalHeight * SCALE_UP;

    if (targetWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = targetWidth / aspectRatio;
    }

    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = targetHeight * aspectRatio;
    }

    const targetLeft = (viewportWidth - targetWidth) / 2;
    const targetTop = (viewportHeight - targetHeight) / 2;

    setImagePosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    setFinalImagePosition({
      top: targetTop,
      left: targetLeft,
      width: targetWidth,
      height: targetHeight,
    });

    setSelectedImage(img);
    setSelectedIndex(index);

    setTimeout(() => setIsModalOpen(true), 10);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /* -----------------------------
     CLEANUP AFTER CLOSE
  ----------------------------- */
  useEffect(() => {
    if (selectedImage && !isModalOpen) {
      const timer = setTimeout(() => {
        setSelectedImage(null);
        setImagePosition(null);
        setSelectedIndex(null);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isModalOpen, selectedImage]);

  const modalStyle =
    imagePosition
      ? isModalOpen && finalImagePosition
        ? finalImagePosition
        : imagePosition
      : {};

  return (
    <>
      <Logo top="1.5vw" left="50%" width="20vw" center />
      <BackButton />

      <div className="gallery-scroll">
        <div className="gallery-container">
          {images.map((img, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`gallery-item ${
                index < visibleCount ? "show" : ""
              }`}
              style={{ transitionDelay: `${index * 40}ms` }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => handleMouseLeave(index)}
            >
              <div className="tilt-outer">
                <div className="tilt-inner">
                  <img
                    src={img.src}
                    alt={img.label}
                    draggable="false"
                    onClick={() => handleImageClick(img, index)}
                    style={{
                      cursor: "pointer",

                      // CRITICAL: keep hidden while modal active
                      opacity:
                        selectedIndex === index && selectedImage ? 0 : 1,

                      transition: "none",
                    }}
                  />
                </div>
              </div>

              <p>{img.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedImage && imagePosition && (
        <div
          className={`modal-overlay ${isModalOpen ? "open" : "closing"}`}
          onClick={handleCloseModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.src}
              alt={selectedImage.label}
              className="modal-image"
              style={{
                top: `${modalStyle.top}px`,
                left: `${modalStyle.left}px`,
                width: `${modalStyle.width}px`,
                height: `${modalStyle.height}px`,
              }}
            />

            <button className="close-button" onClick={handleCloseModal}>
              <img src="/x/x.png" className="close-icon default" />
              <img src="/x/x-hover.png" className="close-icon hover" />
              <img src="/x/x-press.png" className="close-icon press" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}