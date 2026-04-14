import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

export default function BackButton({
  normalImage = "/back/BackArrow.png",
  hoverImage = "/back/BackArrowHover.png",
  clickImage = "/back/BackArrowSelect.png",
}) {
  const navigate = useNavigate();
  const [state, setState] = useState("normal");

  const handleMouseDown = () => {
    setState("click");
  };

  const handleMouseUp = () => {
    setState("hover");
    navigate(-1);
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
