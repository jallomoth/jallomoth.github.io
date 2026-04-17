import { useMemo, useState } from "react";
import Logo from "../components/Logo";
import ParallaxBackground from "../components/ParallaxBackground";

export default function NotFound() {
  const mediaList = [
    "/404/bdumbudbump.mp4",
    "/404/charo.gif",
    "/404/momachu.jpg",
    "/404/breaking-bad.jpg",
  ];

  const selectedMedia = useMemo(() => {
    const index = Math.floor(Math.random() * mediaList.length);
    return mediaList[index];
  }, []);

  const isVideo = selectedMedia.endsWith(".mp4");
  const [videoError, setVideoError] = useState(false);

  // -----------------------------
  // MEDIA STYLES
  // -----------------------------
  const mediaContainerStyle = {
    position: "fixed",

    width: "50vh",
    height: "50vh",

    left: "50%",
    transform: "translateX(-50%)",

    bottom: "10vh",

    zIndex: 1,

    overflow: "hidden",
  };

  const mediaStyle = {
    width: "100%",
    height: "100%",
    objectFit: "fill",
    filter: "brightness(0.7) contrast(1.1)",
  };

  return (
    <>
      {/* -----------------------------
          PARALLAX BACKGROUND
      ----------------------------- */}
      <ParallaxBackground />

      {/* -----------------------------
          MEDIA CONTAINER
      ----------------------------- */}
      <div style={mediaContainerStyle}>
        {isVideo && !videoError ? (
          <video
            src={selectedMedia}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            style={mediaStyle}
          />
        ) : (
          <img
            src={isVideo ? "/404/momachu.jpg" : selectedMedia}
            alt=""
            draggable={false}
            style={mediaStyle}
          />
        )}
      </div>

      {/* LOGO */}
      <Logo top="2vh" width="40vw" />

      {/* -----------------------------
          CONTENT (TOP-POSITIONED)
      ----------------------------- */}
      <div
        style={{
          position: "fixed",
          top: "20vh",
          left: "50%",
          transform: "translateX(-50%)",

          zIndex: 2,

          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            color: "#5C33FF",
            fontSize: "5vh",
            margin: 0,

            fontFamily: "'Arial', 'Arial Black', sans-serif",

            WebkitTextStroke: "0.2vh black",
          }}
        >
          404 ERROR<br />
          ermm dafuq ... (╯°□°)╯︵ ┻━┻
        </h1>
      </div>
    </>
  );
}