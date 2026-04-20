import GalleryItem from "./GalleryItem";
import "./GallerySection.css";

export default function GallerySection({
  section,
  imgs,
  startIndex,
  visibleCount,
  itemRefs,
  onImageClick,
  selectedIndex,
  isModalOpen,
  isModalClosing,
  sectionRef,
}) {
  let localIndex = startIndex;

  return (
    <div
      className="gallery-section"
      ref={sectionRef}
    >
      <h2 className="gallery-year">{section}</h2>

      <div className="gallery-container">
        {imgs.map((img) => {
          const index = localIndex++;

          return (
            <GalleryItem
              key={index}
              img={img}
              index={index}
              visible={index < visibleCount}
              itemRef={(el) => (itemRefs.current[index] = el)}
              onClick={() => onImageClick(img, index)}
              isSelected={selectedIndex === index}
              isModalOpen={isModalOpen}
              isModalClosing={isModalClosing}
            />
          );
        })}
      </div>
    </div>
  );
}