// Backstage page — placeholder; content not yet implemented.
import { useState, useEffect } from "react";
import './PlaceholderPage.css';
import './Jalloseum.css';
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import usePageTitle from "../hooks/usePageTitle";

const CLICK_COUNT_KEY = "logo-click-count";

function getClickCount() {
  return parseInt(localStorage.getItem(CLICK_COUNT_KEY) || "0", 10);
}

export default function Backstage() {
  usePageTitle("Jallomoth — Backstage");

  const [clickCount, setClickCount] = useState(getClickCount);

  // Keep the displayed count in sync when the Logo component fires a click.
  useEffect(() => {
    const handler = (e) => setClickCount(e.detail.count);
    window.addEventListener("logo-click-count-changed", handler);
    return () => window.removeEventListener("logo-click-count-changed", handler);
  }, []);

  const handleReset = () => {
    localStorage.removeItem(CLICK_COUNT_KEY);
    setClickCount(0);
  };

  return (
    <>
      <Logo top="20px" left="50%" width="35vw" center={true} />
      <BackButton />
      <main className="page-content">
        <h1>Backstage</h1>
        <p>Coming soon...</p>
        <p style={{ marginTop: "2rem", opacity: 0.8 }}>
          Logo clicks: <strong>{clickCount}</strong>
        </p>
        <button
          onClick={handleReset}
          className="jalloseum-hub-link"
          style={{ marginTop: "0.75rem" }}
        >
          Reset click counter
        </button>
      </main>
    </>
  );
}