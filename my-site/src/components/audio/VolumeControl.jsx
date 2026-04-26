import { useState, useRef, useEffect } from "react";
import { useAudio } from "./AudioContext";
import { useDrag } from "../../contexts/DragContext";
import "./VolumeControl.css";

// True on any touch-primary device (phones, tablets)
const IS_TOUCH_DEVICE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export default function VolumeControl() {
  const { volume, setVolume, muted, toggleMute } = useAudio();
  const { isGrabbingRef } = useDrag();

  // slider is shown only when hovering the icon; stays open while over slider or dragging
  const [sliderVisible, setSliderVisible] = useState(false);
  const [sliderClosing, setSliderClosing] = useState(false);
  const sliderVisibleRef = useRef(false); // ref so timers can read current value
  const hideTimer    = useRef(null);
  const closingTimer = useRef(null);
  const overControl  = useRef(false); // true while mouse is over icon or slider

  // keep ref in sync
  const setSliderVisibleSynced = (val) => {
    sliderVisibleRef.current = val;
    setSliderVisible(val);
  };

  const scheduleHide = () => {
    // Never auto-hide on touch devices — slider stays open
    if (IS_TOUCH_DEVICE) return;
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      // only animate away if the slider is actually visible
      if (!sliderVisibleRef.current) return;
      // start exit animation, then unmount after it completes
      setSliderClosing(true);
      closingTimer.current = setTimeout(() => {
        setSliderVisibleSynced(false);
        setSliderClosing(false);
      }, 200);
    }, 400); // generous delay so mouse can travel to slider
  };

  const cancelHide = () => {
    clearTimeout(hideTimer.current);
    clearTimeout(closingTimer.current);
    setSliderClosing(false); // abort any in-progress exit animation
  };

  const [iconHovered, setIconHovered] = useState(false);
  const [iconPressed, setIconPressed] = useState(false);

  const [thumbHovered, setThumbHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const sliderRef = useRef(null);

  // On touch devices the slider is shown/hidden by tapping the icon.
  // (The permanent-show approach was removed because it covered page content.)

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
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();

    const usableHeight = rect.height - TOP_PADDING - BOTTOM_PADDING;

    let y = clientY - rect.top - TOP_PADDING;

    let percent = 1 - y / usableHeight;

    percent = Math.max(0, Math.min(1, percent));
    setVolume(percent);
  };

  const handleSliderMouseDown = (e) => {
    setDragging(true);
    isGrabbingRef.current = true;
    updateVolumeFromMouse(e.clientY);
  };

  // Touch drag handlers for mobile slider
  const handleSliderTouchStart = (e) => {
    setDragging(true);
    isGrabbingRef.current = true;
    updateVolumeFromMouse(e.touches[0].clientY);
  };

  const handleSliderTouchMove = (e) => {
    if (dragging) updateVolumeFromMouse(e.touches[0].clientY);
  };

  const handleSliderTouchEnd = () => {
    setDragging(false);
    isGrabbingRef.current = false;
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (dragging) {
        cancelHide(); // keep slider open while actively dragging
        updateVolumeFromMouse(e.clientY);
      }
    };

    const handleUp = () => {
      setIconPressed(false);
      isGrabbingRef.current = false;
      if (dragging) {
        setDragging(false);
        // only schedule hide if mouse has left the control
        if (!overControl.current) scheduleHide();
      }
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
    >
      {/* ICON */}
      <img
        src={getIconImage()}
        className="volume-icon"
        alt="volume"
        draggable="false"
        onClick={toggleMute}
        onMouseEnter={() => { setIconHovered(true); overControl.current = true; cancelHide(); setSliderVisibleSynced(true); }}
        onMouseLeave={() => { setIconHovered(false); overControl.current = false; scheduleHide(); }}
        onMouseDown={() => {
          setIconPressed(true);
        }}
      />

      {/* SLIDER — only rendered on non-touch (mouse/pointer) devices */}
      {!IS_TOUCH_DEVICE && (sliderVisible || dragging || sliderClosing) && (
      <div
        className={`volume-slider${sliderClosing ? " closing" : ""}`}
        onMouseEnter={() => { overControl.current = true; cancelHide(); }}
        onMouseLeave={() => { overControl.current = false; scheduleHide(); }}
      >
        <div
          className="slider-track"
          ref={sliderRef}
          onMouseDown={handleSliderMouseDown}
          onTouchStart={handleSliderTouchStart}
          onTouchMove={handleSliderTouchMove}
          onTouchEnd={handleSliderTouchEnd}
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
      )}
    </div>
  );
}