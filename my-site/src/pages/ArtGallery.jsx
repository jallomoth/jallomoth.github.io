// Art Gallery page — shows fan-submitted artwork grouped by year and category.
// Clicking a thumbnail opens a fullscreen modal with an expand animation.
// Supports keyboard navigation, touch swipe, and pinch-to-zoom in the modal.
import { useMemo } from "react";
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import ErrorBoundary from "../components/ErrorBoundary";

import Gallery from "../components/gallery/Gallery";
import useGalleryImages from "../components/gallery/useGalleryImages";
import usePageTitle from "../hooks/usePageTitle";
import useImageModal from "../hooks/useImageModal";
import ImageModal from "../components/ImageModal";

// Normalize special folder names to their display-label equivalents.
// Keys are lowercased folder names; values are the canonical display labels.
const SECTION_MAP = {
  "hall of fame": "Hall of Fame",
  "fools errand": "Fool's Errand",
  "fool's errand": "Fool's Errand",
};

// Defines the sort position of named sections. Unlisted sections sort to
// priority 1, which places them between Hall of Fame (0) and Fool's Errand (2).
const SORT_ORDER = {
  "Hall of Fame": 0,
  "Fool's Errand": 2,
};

export default function ArtGallery() {
  usePageTitle("Jallomoth — Art Gallery");

  const { images, grouped } = useGalleryImages(SECTION_MAP, SORT_ORDER);

  // Pass a flat ordered array so the hook can navigate across sections.
  const flatImages = useMemo(
    () => grouped.flatMap(([, imgs]) => imgs),
    [grouped]
  );

  const modal = useImageModal(flatImages);

  return (
    <>
      <Logo className="subpage-logo" top="2rem" left="50%" width="clamp(18vw, 35vw, 35rem)" center />
      <BackButton />

      <main>
      <ErrorBoundary>
      <Gallery
        groupedImages={grouped}
        selectedIndex={modal.selectedIndex}
        isModalOpen={modal.isModalOpen}
        isModalClosing={modal.isModalClosing}
        itemRefs={modal.itemRefs}
        onImageClick={modal.handleImageClick}
      />
      </ErrorBoundary>

      <ImageModal {...modal} />
      </main>
    </>
  );
}