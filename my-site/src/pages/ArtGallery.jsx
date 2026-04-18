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

    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateY = ((x - midX) / midX) * 8;
    const rotateX = ((midY - y) / midY) * 8;

    const inner = el.querySelector(".tilt-inner");

    if (inner) {
      inner.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.05)
        translateZ(0)
      `;
    }
  };

  const handleMouseLeave = (index) => {
    const el = itemRefs.current[index];
    if (!el) return;

    const inner = el.querySelector(".tilt-inner");

    if (inner) {
      inner.style.transform = `
        rotateX(0deg)
        rotateY(0deg)
        scale(1)
        translateZ(0)
      `;
    }
  };

  /* -----------------------------
     CLICK → MODAL
  ----------------------------- */
  const handleImageClick = (img, index) => {
    const el = itemRefs.current[index];
    if (!el) return;

    const imgElement = el.querySelector("img");
    if (!imgElement) return;

    const rect = imgElement.getBoundingClientRect();

    const naturalWidth = imgElement.naturalWidth || rect.width;
    const naturalHeight = imgElement.naturalHeight || rect.height;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxW = vw * 0.9;
    const maxH = vh * 0.9;

    const ratio = naturalWidth / naturalHeight;

    let targetW = naturalWidth;
    let targetH = naturalHeight;

    if (targetW > maxW) {
      targetW = maxW;
      targetH = targetW / ratio;
    }

    if (targetH > maxH) {
      targetH = maxH;
      targetW = targetH * ratio;
    }

    setImagePosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    setFinalImagePosition({
      top: (vh - targetH) / 2,
      left: (vw - targetW) / 2,
      width: targetW,
      height: targetH,
    });

    setSelectedImage(img);
    setSelectedIndex(index);

    setTimeout(() => setIsModalOpen(true), 10);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (selectedImage && !isModalOpen) {
      const t = setTimeout(() => {
        setSelectedImage(null);
        setImagePosition(null);
        setSelectedIndex(null);
      }, 500);

      return () => clearTimeout(t);
    }
  }, [isModalOpen, selectedImage]);

  const modalStyle =
    imagePosition && finalImagePosition
      ? isModalOpen
        ? finalImagePosition
        : imagePosition
      : {};

  /* -----------------------------
     RENDER
  ----------------------------- */
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
              {/* ✅ FIXED CLICK + TILT */}
              <div className="tilt-outer">
                <div
                  className="tilt-inner"
                  onClick={() => handleImageClick(img, index)}
                  style={{
                    cursor: "pointer",
                    opacity: selectedIndex === index ? 0 : 1,
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    draggable="false"
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
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.label}
              className="modal-image"
              style={{
                top: modalStyle.top,
                left: modalStyle.left,
                width: modalStyle.width,
                height: modalStyle.height,
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