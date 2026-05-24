// Fullscreen toggle button — fixed top-left, mirrors the volume button's placement.
// Shows enter/exit variants, each with normal / hover / click states.
// Images are served from public/fullscreen/ and follow this naming convention:
//   Fullscreen.png         FullscreenHover.png         FullscreenClick.png
//   FullscreenExit.png     FullscreenExitHover.png     FullscreenExitClick.png
import { useState, useEffect } from "react";
import { useAudio } from "../../contexts/AudioContext";
import "./FullscreenButton.css";

const IS_DESKTOP = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export default function FullscreenButton() {
  if (!IS_DESKTOP) return null;
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [hovered, setHovered]           = useState(false);
  const [pressed, setPressed]           = useState(false);
  const { effectiveVolume, playSound }  = useAudio();

  // Keep isFullscreen in sync when the user presses Esc or the browser exits.
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const getImage = () => {
    if (isFullscreen) {
      if (pressed)  return "/buttons/fullscreen/FullscreenExit-select.png";
      if (hovered)  return "/buttons/fullscreen/FullscreenExit-hover.png";
      return "/buttons/fullscreen/FullscreenExit.png";
    }
    if (pressed)  return "/buttons/fullscreen/Fullscreen-select.png";
    if (hovered)  return "/buttons/fullscreen/Fullscreen-hover.png";
    return "/buttons/fullscreen/Fullscreen.png";
  };

  return (
    <div className="fullscreen-container">
      <img
        src={getImage()}
        className="fullscreen-icon"
        alt={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        draggable="false"
        onClick={toggleFullscreen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); playSound("/sounds/misc/Click.mp3", effectiveVolume * 0.2); }}
      />
    </div>
  );
}
