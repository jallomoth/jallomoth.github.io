import { useState, useRef, useEffect } from "react";
import { useAudio } from "./AudioContext";
import "./VolumeControl.css";

export default function VolumeControl() {
  const { volume, setVolume, muted, toggleMute } = useAudio();

  const [containerHovered, setContainerHovered] = useState(false);

  const [iconHovered, setIconHovered] = useState(false);
  const [iconPressed, setIconPressed] = useState(false);

  const [thumbHovered, setThumbHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const sliderRef = useRef(null);

  // -----------------------------
  // VW → PX RESPONSIVE PADDING
  // -----------------------------
  const TOP_PADDING_VW = 1.0;
  const BOTTOM_PADDING_VW = 1.2;

  const [padding, setPadding] = useState({
    top: 0,
    bottom: 0,
  });

  useEffect(() => {
    const updatePadding = () => {
      setPadding({
        top: (window.innerWidth * TOP_PADDING_VW) / 100,
        bottom: (window.innerWidth * BOTTOM_PADDING_VW) / 100,
      });
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);

    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  const TOP_PADDING = padding.top;
  const BOTTOM_PADDING = padding.bottom;

  // -----------------------------
  // VOLUME CALCULATION
  // -----------------------------
  const updateVolumeFromMouse = (clientY) => {
    const rect = sliderRef.current.getBoundingClientRect();

    const usableHeight = rect.height - TOP_PADDING - BOTTOM_PADDING;

    let y = clientY - rect.top - TOP_PADDING;

    let percent = 1 - y / usableHeight;

    percent = Math.max(0, Math.min(1, percent));
    setVolume(percent);
  };

  const handleSliderMouseDown = (e) => {
    setDragging(true);
    window.isGrabbing = true;
    updateVolumeFromMouse(e.clientY);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (dragging) updateVolumeFromMouse(e.clientY);
    };

    const handleUp = () => {
      setDragging(false);
      setIconPressed(false);
      window.isGrabbing = false;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  // -----------------------------
  // THUMB POSITION (VW-AWARE)
  // -----------------------------
  const thumbPosition = `calc(${TOP_PADDING}px + ${(1 - volume) * 100}% - ${
    (1 - volume) * (TOP_PADDING + BOTTOM_PADDING)
  }px)`;

  // -----------------------------
  // THUMB IMAGE
  // -----------------------------
  const getThumbImage = () => {
    if (dragging) return "/volume/thumb-grab.png";
    if (thumbHovered) return "/volume/thumb-hover.png";
    return "/volume/thumb.png";
  };

  // -----------------------------
  // ICON IMAGE
  // -----------------------------
  const getIconImage = () => {
    if (muted) {
      if (iconPressed) return "/volume/mute-grab.png";
      if (iconHovered) return "/volume/mute-hover.png";
      return "/volume/mute.png";
    } else {
      if (iconPressed) return "/volume/on-grab.png";
      if (iconHovered) return "/volume/on-hover.png";
      return "/volume/on.png";
    }
  };

  return (
    <div
      className="volume-container"
      onMouseEnter={() => setContainerHovered(true)}
      onMouseLeave={() => setContainerHovered(false)}
    >
      {/* ICON */}
      <img
        src={getIconImage()}
        className="volume-icon"
        alt="volume"
        draggable="false"
        onClick={toggleMute}
        onMouseEnter={() => setIconHovered(true)}
        onMouseLeave={() => setIconHovered(false)}
        onMouseDown={() => {
          setIconPressed(true);
        }}
      />

      {/* SLIDER */}
      <div className={`volume-slider ${containerHovered ? "show" : ""}`}>
        <div
          className="slider-track"
          ref={sliderRef}
          onMouseDown={handleSliderMouseDown}
        >
          {/* TRACK */}
          <img
            src="/volume/slider.png"
            className="slider-track-img"
            draggable="false"
          />

          {/* THUMB */}
          <img
            src={getThumbImage()}
            className="slider-thumb"
            style={{ top: thumbPosition }}
            draggable="false"
            onMouseEnter={() => setThumbHovered(true)}
            onMouseLeave={() => setThumbHovered(false)}
          />
        </div>
      </div>
    </div>
  );
}