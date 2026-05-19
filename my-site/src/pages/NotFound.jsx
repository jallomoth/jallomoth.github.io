import { useMemo, useState } from "react";
import Logo from "../components/Logo";
import ParallaxBackground from "../components/ParallaxBackground";
import ErrorBoundary from "../components/ErrorBoundary";

// --- MEDIA IMPORTS ---
// import.meta.glob eagerly imports all media files so Vite bundles them.
// The result is an array of resolved asset URLs.
const mediaModules = import.meta.glob(
  "../assets/404/**/*.{png,jpg,jpeg,gif,webp,mp4,webm,PNG,JPG,JPEG,GIF,WEBP,MP4,WEBM,mov}",
  { eager: true }
);

// Convert module map to a flat array of resolved asset URLs.
const mediaList = Object.values(mediaModules).map((mod) => mod.default);

export default function NotFound() {
  const selectedMedia = useMemo(() => {
    const index = Math.floor(Math.random() * mediaList.length);
    return mediaList[index];
  }, []);

  const isVideo =
    selectedMedia.endsWith(".mp4") || selectedMedia.endsWith(".webm");

  const [videoError, setVideoError] = useState(false);

  // --- MEDIA STYLES ---
  // min(50vh, 85vw) avoids horizontal overflow on portrait mobile where
  // 50vh could exceed the viewport width.
  const mediaSize = "min(50vh, 85vw)";
  const mediaContainerStyle = {
    position: "fixed",

    width: mediaSize,
    height: mediaSize,

    left: "50%",
    transform: "translateX(-50%)",

    bottom: "8vh",

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
      {/* BACKGROUND */}
      <ParallaxBackground />

      <main>
        {/* MEDIA */}
        <ErrorBoundary>
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
            src={selectedMedia}
            alt=""
            draggable={false}
            style={mediaStyle}
          />
        )}
        </div>
        </ErrorBoundary>

        {/* TEXT */}
        <div
          style={{
            position: "fixed",
            top: "20vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90vw",
            maxWidth: "700px",

            zIndex: 2,

            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <h1
            style={{
              color: "#5C33FF",
              fontSize: "min(5vh, 7vw)",
              margin: 0,

              fontFamily: '"Chelsea Market", system-ui',

              WebkitTextStroke: "0.2vh black",
              lineHeight: 1.4,
            }}
          >
            404 ERROR<br />
            <span style={{ whiteSpace: "nowrap" }}>(╯°□°)╯︵ ┻━┻</span><br />
            erm ... dafuq ?
          </h1>
        </div>
      </main>

      {/* LOGO */}
      <Logo top="2vh" width="40vw" />
    </>
  );
}