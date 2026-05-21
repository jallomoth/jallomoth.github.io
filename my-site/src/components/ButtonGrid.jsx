// Home screen navigation grid — splits the BUTTONS list into rows of
// BUTTONS_PER_ROW and renders each as a NavButton.
// External URLs (http/https) are opened in a new tab by NavButton.
// Screensaver state is managed by the parent (Home.jsx) and passed down
// via the ssRef prop; this component just wires indices to each button.
import "./ButtonGrid.css";
import NavButton from "./NavButton";

const BUTTONS_PER_ROW = 4;

const BUTTONS = [
  { label: "Fool's Errand", alt: "Fool's Errand", to: "/fools-errand", image: "/icons/Fools-Errand.png", textImage: "/icons/Fools-Errand-text.png", clickSound: "/sounds/nav/FoolsErrand.mp3" },
  { label: "Jalloseum",     alt: "Jalloseum",     to: "/jalloseum",    image: "/icons/Jalloseum.png",     textImage: "/icons/Jalloseum-text.png",     clickSound: "/sounds/nav/Jalloseum.mp3" },
  { label: "Art Gallery",   alt: "Art Gallery",   to: "/art-gallery",  image: "/icons/Art-Gallery.png",  textImage: "/icons/Art-Gallery-text.png",  clickSound: "/sounds/nav/ArtGallery.mp3" },
  { label: "Commissions",   alt: "Commissions",   to: "/commissions",  image: "/icons/Commissions.png",  textImage: "/icons/Commissions-text.png",  clickSound: "/sounds/nav/Commissions.mp3" },
  { label: "YouTube",       alt: "YouTube",       to: "https://youtube.com/@jallomoth",          image: "/icons/YouTube.png",   textImage: "/icons/YouTube-text.png",   clickSound: "/sounds/nav/YouTube.mp3" },
  { label: "Community",     alt: "Community",     to: "/community",   image: "/icons/Community.png",   textImage: "/icons/Community-text.png",   clickSound: "/sounds/nav/Community.mp3" },
  { label: "Patreon",       alt: "Patreon",       to: "https://www.patreon.com/Jallomoth", image: "/icons/Patreon.png",     textImage: "/icons/Patreon-text.png",     clickSound: "/sounds/nav/Patreon.mp3" },
  { label: "Backstage",     alt: "Backstage",     to: "/backstage",   image: "/icons/Backstage.png",   textImage: "/icons/Backstage-text.png",   clickSound: "/sounds/nav/Backstage.mp3" },
];

// Split a flat array into rows of BUTTONS_PER_ROW length.
function chunkButtons(buttons) {
  const rows = [];
  for (let i = 0; i < buttons.length; i += BUTTONS_PER_ROW) {
    rows.push(buttons.slice(i, i + BUTTONS_PER_ROW));
  }
  return rows;
}

export default function ButtonGrid({ ssRef, screensaverActive }) {
  const rows = chunkButtons(BUTTONS);

  return (
    <div className={`button-grid${screensaverActive ? " screensaver" : ""}`}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="button-row">
          {row.map((btn, colIndex) => {
            const ssIndex = rowIndex * BUTTONS_PER_ROW + colIndex;
            return (
              <NavButton
                key={colIndex}
                {...btn}
                ssRef={ssRef}
                ssIndex={ssIndex}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
