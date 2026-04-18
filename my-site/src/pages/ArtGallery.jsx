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

const images = Object.entries(imageModules).map(([path, mod]) => {
  const fileName = path.split("/").pop().split(".")[0];

  const label = fileName
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    src: mod.default,
    label,
  };
});

/* -----------------------------
   COMPONENT
----------------------------- */

export default function ArtGallery() {
  const [visibleCount, setVisibleCount] = useState(0);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState(null);
  const [finalImagePosition, setFinalImagePosition] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const itemRefs = useRef([]);
  const tiltRefs = useRef([]);
  const tiltState = useRef({}); // per-index tilt data

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
     LERP LOOP
  ----------------------------- */
  useEffect(() => {
    let frame;

    const animate = () => {
      Object.keys(tiltState.current).forEach((key) => {
        const state = tiltState.current[key];
        const el = tiltRefs.current[key];
        if (!state || !el) return;

        // lerp toward target
        state.currentX += (state.targetX - state.currentX) * 0.12;
        state.currentY += (state.targetY - state.currentY) * 0.12;

        el.style.transform = `
          rotateX(${state.currentX}deg)
          rotateY(${state.currentY}deg)
          scale(1.05)
          translateZ(0)
        `;
      });

      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  /* -----------------------------
     TILT HANDLERS
  ----------------------------- */
  const handleTilt = (e, index) => {
    const el = tiltRefs.current[index];
    if (!el) return;

    const rect = el.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 14;
    const rotateX = (0.5 - y) * 14;

    if (!tiltState.current[index]) {
      tiltState.current[index] = {
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
      };
    }

    tiltState.current[index].targetX = rotateX;
    tiltState.current[index].targetY = rotateY;
  };

  const resetTilt = (index) => {
    if (!tiltState.current[index]) return;

    tiltState.current[index].targetX = 0;
    tiltState.current[index].targetY = 0;
  };

  /* -----------------------------
     IMAGE CLICK
  ----------------------------- */
  const handleImageClick = (img, index) => {
    const imgEl = itemRefs.current[index]?.querySelector("img");
    if (!imgEl) return;

    const rect = imgEl.getBoundingClientRect();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxW = vw * 0.9;
    const maxH = vh * 0.9;

    const aspect = rect.width / rect.height;

    let w = rect.width;
    let h = rect.height;

    if (w > maxW) {
      w = maxW;
      h = w / aspect;
    }

    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }

    const left = (vw - w) / 2;
    const top = (vh - h) / 2;

    setImagePosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    setFinalImagePosition({
      top,
      left,
      width: w,
      height: h,
    });

    setSelectedImage(img);

    requestAnimationFrame(() => {
      setIsModalOpen(true);
    });
  };

  /* -----------------------------
     CLOSE MODAL
  ----------------------------- */
  const handleCloseModal = () => {
    setIsClosing(true);
    setIsModalOpen(false);

    setTimeout(() => {
      setSelectedImage(null);
      setImagePosition(null);
      setFinalImagePosition(null);
      setIsClosing(false);
    }, 500);
  };

  const modalStyle =
    isModalOpen && finalImagePosition
      ? finalImagePosition
      : imagePosition || {};

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
            >
              <div
                className="tilt-outer"
                onMouseMove={(e) => handleTilt(e, index)}
                onMouseLeave={() => resetTilt(index)}
              >
                <div
                  className="tilt-inner"
                  ref={(el) => (tiltRefs.current[index] = el)}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    draggable="false"
                    onClick={() => handleImageClick(img, index)}
                    style={{
                      cursor: "pointer",
                      opacity: selectedImage === img ? 0 : 1,
                    }}
                  />
                </div>
              </div>

              <p>{img.label}</p>
            </div>
          ))}
        </div>
      </div>

      {(selectedImage || isClosing) && imagePosition && (
        <div
          className={`modal-overlay ${
            isModalOpen ? "open" : "closing"
          }`}
          onClick={handleCloseModal}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage?.src}
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