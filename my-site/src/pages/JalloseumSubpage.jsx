// Jalloseum subpage — shows a scrollable image grid for one art category.
// Clicking a thumbnail opens a fullscreen modal with an expand animation
// that originates from the thumbnail's position. Supports keyboard
// navigation (arrow keys), touch swipe, and pinch-to-zoom inside the modal.
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import ErrorBoundary from "../components/ErrorBoundary";
import JalloseumGallery from "../components/gallery/JalloseumGallery";
import useJalloseumImages from "../components/gallery/useJalloseumImages";
import usePageTitle from "../hooks/usePageTitle";
import useImageModal from "../hooks/useImageModal";
import ImageModal from "../components/ImageModal";

import "./Jalloseum.css";

export default function JalloseumSubpage({ subfolder, title }) {
  usePageTitle("Jallomoth — Jalloseum");

  const images = useJalloseumImages(subfolder);
  const modal = useImageModal(images);

  return (
    <>
      <Logo className="subpage-logo" top="2rem" left="50%" width="clamp(18vw, 35vw, 35rem)" center />
      <BackButton to="/jalloseum" />

      <main>
        <ErrorBoundary>
          <JalloseumGallery
            images={images}
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