import { useEffect, useRef, useState } from "react";
import GallerySection from "./GallerySection";
import "./Gallery.css";

export default function Gallery({ groupedImages, images, selectedIndex, isModalOpen, isModalClosing, onImageClick }) {
  const [visibleCount, setVisibleCount] = useState(0);

  const itemRefs = useRef([]);
  const sectionRefs = useRef({});
  const scrollRef = useRef(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= images.length) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToSection = (section) => {
    const container = scrollRef.current;
    const target = sectionRefs.current[section];
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const offsetPx =
      (parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--ui-top-space")
      ) / 100) * window.innerWidth;

    container.scrollTo({
      top:
        targetRect.top -
        containerRect.top +
        container.scrollTop -
        offsetPx,
      behavior: "smooth",
    });
  };

  const handleImageClick = (img, index) => {
    const el = itemRefs.current[index]?.querySelector("img");
    if (!el) return;

    const rect = el.getBoundingClientRect();
    onImageClick(img, index, rect);
  };

  let globalIndex = 0;

  return (
    <div className="gallery-scroll" ref={scrollRef}>
      {/* NAV */}
      <div className="gallery-nav">
        {groupedImages.map(([section]) => (
          <button
            key={section}
            className="gallery-nav-button"
            onClick={() => scrollToSection(section)}
          >
            <img src={`/nav/${section}.png`} alt={section} />
          </button>
        ))}
      </div>

      {/* SECTIONS */}
      {groupedImages.map(([section, imgs]) => {
        const startIndex = globalIndex;
        globalIndex += imgs.length;

        return (
          <GallerySection
            key={section}
            section={section}
            imgs={imgs}
            startIndex={startIndex}
            visibleCount={visibleCount}
            itemRefs={itemRefs}
            onImageClick={handleImageClick}
            selectedIndex={selectedIndex}
            isModalOpen={isModalOpen}
            isModalClosing={isModalClosing}
            sectionRef={(el) =>
              (sectionRefs.current[section] = el)
            }
          />
        );
      })}
    </div>
  );
}