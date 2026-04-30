import { useRef } from "react";
import GalleryItem from "./GalleryItem";
import "./Gallery.css";
import "./GallerySection.css";

export default function JalloseumGallery({
  images,
  selectedIndex,
  isModalOpen,
  isModalClosing,
  onImageClick,
  itemRefs: externalItemRefs,
}) {
  const internalItemRefs = useRef([]);
  const itemRefs = externalItemRefs ?? internalItemRefs;
  const scrollRef = useRef(null);

  const handleImageClick = (img, index) => {
    const el = itemRefs.current[index]?.querySelector("img");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onImageClick(img, index, rect);
  };

  return (
    <div className="gallery-scroll" ref={scrollRef}>
      <div className="gallery-container jalloseum-grid">
        {images.map((img, index) => (
          <GalleryItem
            key={index}
            img={img}
            index={index}
            itemRef={(el) => (itemRefs.current[index] = el)}
            onClick={() => handleImageClick(img, index)}
            isSelected={selectedIndex === index}
            isModalOpen={isModalOpen}
            isModalClosing={isModalClosing}
            showTitle={false}
          />
        ))}
      </div>
    </div>
  );
}
