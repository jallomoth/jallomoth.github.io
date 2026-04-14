import { useState } from "react";
import "./Logo.css";

export default function Logo() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="logo-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src="/logo/Jallogo.png"
        className={`logo-img ${hovered ? "fade-out" : "fade-in"}`}
        alt="Logo"
      />
      <img
        src="/logo/JallogoHover.png"
        className={`logo-img logo-hover ${hovered ? "fade-in" : "fade-out"}`}
        alt="Logo Hover"
      />
    </div>
  );
}