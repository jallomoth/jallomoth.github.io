import { useState } from "react";
import { useAudio } from "./AudioContext";
import "./VolumeControl.css";

export default function VolumeControl() {
  const { volume, setVolume, muted, toggleMute } = useAudio();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="volume-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={muted ? "/volume/mute.png" : "/volume/on.png"}
        className="volume-icon"
        onClick={toggleMute}
        alt="volume"
        draggable="false"
      />

      <div className={`volume-slider ${hovered ? "show" : ""}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}