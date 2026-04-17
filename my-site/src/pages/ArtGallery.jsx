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

/* -----------------------------
   COMPONENT
----------------------------- */

export default function ArtGallery() {
  const [visibleCount, setVisibleCount] = useState(0);
  const itemRefs = useRef([]);

  // CASCADE LOAD
  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);

      if (i >= images.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  // MASONRY HEIGHT CALC
  useEffect(() => {
    const resizeAll = () => {
      itemRefs.current.forEach((el) => {
        if (!el) return;

        const rowHeight = 10; // must match CSS
        const rowGap = 16; // approx 1vw fallback

        const height = el.querySelector("img")?.getBoundingClientRect().height || 0;

        const span = Math.ceil((height + rowGap) / rowHeight);

        el.style.gridRowEnd = `span ${span}`;
      });
    };

    // run after images load
    setTimeout(resizeAll, 100);

    window.addEventListener("resize", resizeAll);
    return () => window.removeEventListener("resize", resizeAll);
  }, []);

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
              style={{
                transitionDelay: `${index * 40}ms`,
              }}
            >
              <img src={img.src} alt={img.label} draggable="false" />
              <p>{img.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}