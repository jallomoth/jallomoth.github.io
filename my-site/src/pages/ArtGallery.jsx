import { useEffect, useRef, useState } from "react";
import "../App.css";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import "./ArtGallery.css";

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

    // ✅ robust folder detection
    const parts = path.split("/");
    const folder = parts[parts.length - 2]?.toLowerCase() || "";

    let section = "Unknown";

    if (folder === "hall of fame") {
      section = "Hall of Fame !";
    } else if (
      folder === "fools errand" ||
      folder === "fool's errand"
    ) {
      section = "Fool's Errand !";
    } else {
      const match = path.match(/gallery\/(\d{4})\//);
      if (match) section = match[1];
    }

    // clean filename
    const cleanName = fileName
      .replace(/\(.*?\)/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const label = cleanName
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      src: mod.default,
      label,
      fileName,
      section,
    };
  })
  .sort((a, b) => a.fileName.localeCompare(b.fileName));

/* -----------------------------
   GROUP + SORT SECTIONS
----------------------------- */
const groupedImages = Object.entries(
  images.reduce((acc, img) => {
    if (!acc[img.section]) acc[img.section] = [];
    acc[img.section].push(img);
    return acc;
  }, {})
).sort((a, b) => {
  const order = {
    "Hall of Fame !": 0,
    "Fool's Errand !": 2,
  };

  const aKey = a[0];
  const bKey = b[0];

  const aPriority = order[aKey] ?? 1;
  const bPriority = order[bKey] ?? 1;

  // priority sort
  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }

  // year sort (descending)
  return bKey.localeCompare(aKey);
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
    }, 20);

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
     CLICK IMAGE
  ----------------------------- */
  const handleImageClick = (img, index) => {
    const imgElement = itemRefs.current[index]?.querySelector("img");
    if (!imgElement) return;

    imgElement.style.opacity = "0";

    const rect = imgElement.getBoundingClientRect();

    const naturalWidth = imgElement.naturalWidth || rect.width;
    const naturalHeight = imgElement.naturalHeight || rect.height;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxWidth = vw * 0.9;
    const maxHeight = vh * 0.9;

    const aspectRatio = naturalWidth / naturalHeight;

    let targetWidth = naturalWidth * 1.2;
    let targetHeight = naturalHeight * 1.2;

    if (targetWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = targetWidth / aspectRatio;
    }

    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = targetHeight * aspectRatio;
    }

    setImagePosition(rect);
    setFinalImagePosition({
      top: (vh - targetHeight) / 2,
      left: (vw - targetWidth) / 2,
      width: targetWidth,
      height: targetHeight,
    });

    setSelectedImage(img);
    setSelectedIndex(index);

    setTimeout(() => setIsModalOpen(true), 10);
  };

  const handleCloseModal = () => setIsModalOpen(false);

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

  /* -----------------------------
     RENDER
  ----------------------------- */

  let globalIndex = 0;

  return (
    <>
      <Logo top="1vw" left="50%" width="35vw" center />
      <BackButton />

      <div className="gallery-scroll">
        {groupedImages.map(([section, imgs]) => (
          <div key={section} className="gallery-section">
            <h2 className="gallery-year">{section}</h2>

            <div className="gallery-container">
              {imgs.map((img) => {
                const index = globalIndex++;

                return (
                  <div
                    key={index}
                    ref={(el) => (itemRefs.current[index] = el)}
                    className={`gallery-item ${
                      index < visibleCount ? "show" : ""
                    }`}
                    style={{ transitionDelay: `${index * 15}ms` }}
                    onMouseMove={(e) => handleMouseMove(e, index)}
                    onMouseLeave={() => handleMouseLeave(index)}
                  >
                    <div className="tilt-outer">
                      <div className="tilt-inner">
                        <img
                          src={img.src}
                          alt={img.label}
                          draggable="false"
                          loading="lazy"
                          onClick={() => handleImageClick(img, index)}
                          style={{
                            cursor: "pointer",
                            opacity:
                              selectedIndex === index && selectedImage
                                ? 0
                                : 1,
                            transition: "none",
                          }}
                        />
                      </div>
                    </div>

                    <p>{img.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

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
              <img src="/x/x.png" className="close-icon default" draggable={false} />
              <img src="/x/x-hover.png" className="close-icon hover" draggable={false} />
              <img src="/x/x-press.png" className="close-icon press" draggable={false} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}