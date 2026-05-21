// Back button — swaps images for normal/hover/press states and navigates to `to`.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../../contexts/AudioContext";
import "./BackButton.css";

export default function BackButton({
  normalImage = "/buttons/back/BackArrow.png",
  hoverImage = "/buttons/back/BackArrow-hover.png",
  clickImage = "/buttons/back/BackArrow-select.png",
  to = "/",
}) {
  const navigate = useNavigate();
  const [state, setState] = useState("normal");
  const { effectiveVolume, playSound } = useAudio();

  const handleMouseDown = () => {
    setState("click"); // visual only
  };

  const handleMouseUp = () => {
    setState("hover");
    playSound("/sounds/misc/Click.mp3", effectiveVolume * 0.2);
    navigate(to);
  };

  const handleMouseEnter = () => {
    setState("hover");
  };

  const handleMouseLeave = () => {
    setState("normal");
  };

  const getImage = () => {
    switch (state) {
      case "hover":
        return hoverImage;
      case "click":
        return clickImage;
      default:
        return normalImage;
    }
  };

  return (
    <button
      className="back-button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Go back"
    >
      <img src={getImage()} alt="Back button" className="back-button-image" />
    </button>
  );
}