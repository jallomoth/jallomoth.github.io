import { useRef } from "react";
import GallerySection from "./GallerySection";
import "./Gallery.css";

export default function Gallery({ groupedImages, selectedIndex, isModalOpen, isModalClosing, onImageClick, itemRefs: externalItemRefs }) {

  // Allow parent to pass a ref array so the parent (ArtGallery) can read
  // thumbnail DOMRects for keyboard navigation. If not provided, fall back
  // to an internal ref.
  const internalItemRefs = useRef([]);
  const itemRefs = externalItemRefs ?? internalItemRefs;
  const sectionRefs = useRef({});
  const scrollRef = useRef(null);

  const scrollToSection = (section) => {
    const container = scrollRef.current;
    const target = sectionRefs.current[section];
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // Read the resolved pixel value of padding-top directly from computed style.
    // getPropertyValue("--ui-top-space") returns the raw token string (e.g.
    // "clamp(60px, 9vw, 200px)") which parseFloat cannot evaluate — it returns NaN
    // and the scroll is silently skipped.
    const topOffset = parseFloat(getComputedStyle(container).paddingTop) || 0;

    container.scrollTo({
      top:
        targetRect.top -
        containerRect.top +
        container.scrollTop -
        topOffset,
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
            <img src={`/gallery/${section}.png`} alt={section} />
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