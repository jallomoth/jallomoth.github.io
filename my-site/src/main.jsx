import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AudioProvider } from "./components/AudioContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AudioProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AudioProvider>
  </StrictMode>
);