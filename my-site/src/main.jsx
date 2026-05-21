// Entry point — initializes Google Analytics and mounts the React app.
// AudioProvider and DragProvider are placed above BrowserRouter so all
// route components can access audio and drag context.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ReactGA from "react-ga4";
import "./index.css";
import App from "./App.jsx";
import { AudioProvider } from "./contexts/AudioContext";
import { DragProvider } from "./contexts/DragContext";

ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AudioProvider>
      <DragProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DragProvider>
    </AudioProvider>
  </StrictMode>
);