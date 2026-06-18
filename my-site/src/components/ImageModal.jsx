// Fullscreen image modal — backdrop blur + overlay with zoom/pan image and
// close button. Receives the return value of useImageModal spread as props.
import "./gallery/Gallery.css";

export default function ImageModal({
  selectedImage,
  imagePosition,
  isModalOpen,
  isModalClosing,
  closeState,
  setCloseState,
  modalImageRef,
  closeButtonRef,
  modalOverlayRef,
  hasDraggedRef,
  zoomScaleRef,
  handleCloseModal,
  handleImageMouseDown,
  handleModalKeyDown,
}) {
  if (!selectedImage && !isModalClosing) return null;

  return (
    <>
      {/* Dark blur backdrop — separate element so the closing mask on
          .modal-overlay doesn't clip the blur; it fades out uniformly */}
      <div
        className={`modal-backdrop ${isModalOpen ? "open" : ""} ${isModalClosing ? "closing" : ""}`}
      />

      <div
        ref={modalOverlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        className={`modal-overlay ${isModalOpen ? "open" : ""} ${isModalClosing ? "closing" : ""}`}
        onClick={(e) => {
          if (hasDraggedRef.current) { hasDraggedRef.current = false; return; }
          if (zoomScaleRef.current > 1) return;
          // Close only when clicking outside the actual rendered image pixels.
          // The element box is 80vw×80vh; object-fit:contain letterboxes the
          // image inside it, so we must compute the true content rect.
          const imgEl = modalImageRef.current;
          if (imgEl) {
            const elRect = imgEl.getBoundingClientRect();
            const nW = imgEl.naturalWidth;
            const nH = imgEl.naturalHeight;
            let r = elRect;
            if (nW && nH) {
              const s = Math.min(elRect.width / nW, elRect.height / nH);
              const rW = nW * s;
              const rH = nH * s;
              r = {
                left:   elRect.left + (elRect.width  - rW) / 2,
                top:    elRect.top  + (elRect.height - rH) / 2,
                right:  elRect.left + (elRect.width  + rW) / 2,
                bottom: elRect.top  + (elRect.height + rH) / 2,
              };
            }
            if (
              e.clientX >= r.left && e.clientX <= r.right &&
              e.clientY >= r.top  && e.clientY <= r.bottom
            ) return;
          }
          handleCloseModal();
        }}
        onKeyDown={handleModalKeyDown}
      >
        {selectedImage && (
          <img
            ref={modalImageRef}
            className="modal-image"
            src={selectedImage.src}
            alt={selectedImage.label}
            draggable="false"
            onMouseDown={handleImageMouseDown}
            style={{
              top:    `${imagePosition?.top    ?? 0}px`,
              left:   `${imagePosition?.left   ?? 0}px`,
              width:  `${imagePosition?.width  ?? 0}px`,
              height: `${imagePosition?.height ?? 0}px`,
            }}
          />
        )}
        <button
          ref={closeButtonRef}
          className="close-button"
          aria-label="Close"
          onMouseEnter={() => setCloseState("hover")}
          onMouseLeave={() => setCloseState("normal")}
          onMouseDown={() => setCloseState("press")}
          onMouseUp={() => setCloseState("hover")}
          onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
        >
          <img
            className="close-icon"
            src={
              closeState === "press" ? "/buttons/x/X-select.png"
              : closeState === "hover" ? "/buttons/x/X-hover.png"
              : "/buttons/x/X.png"
            }
            alt=""
          />
        </button>
      </div>
    </>
  );
}
