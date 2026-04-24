import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "./audio/AudioContext";
import "./BackButton.css";

export default function BackButton({
  normalImage = "/back/BackArrow.png",
  hoverImage = "/back/BackArrowHover.png",
  clickImage = "/back/BackArrowSelect.png",
}) {
  const navigate = useNavigate();
  const [state, setState] = useState("normal");
  const { effectiveVolume } = useAudio();

  // Audio setup
  const clickSound = useRef(new Audio("/sounds/click.mp3"));

  useEffect(() => {
    const audio = clickSound.current;
    audio.load();
    audio.volume = effectiveVolume * 0.2; // base 0.2
  }, []);

  useEffect(() => {
    if (clickSound.current) {
      clickSound.current.volume = effectiveVolume * 0.2;
    }
  }, [effectiveVolume]);

  const playSound = () => {
    const audio = clickSound.current;

    // allow rapid replays
    audio.currentTime = 0;
    audio.play();
  };

  const handleMouseDown = () => {
    setState("click"); // visual only
  };

  const handleMouseUp = () => {
    setState("hover");

    playSound(); // SOUND NOW ONLY ON RELEASE
    navigate('/');
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