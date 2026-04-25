import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AudioProvider } from "./components/audio/AudioContext";
import { DragProvider } from "./contexts/DragContext";

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