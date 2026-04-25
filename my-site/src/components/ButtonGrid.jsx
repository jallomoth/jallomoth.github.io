import "./ButtonGrid.css";
import ButtonRow from "./ButtonRow";

const BUTTONS_PER_ROW = 4;

const BUTTONS = [
  { label: "Fool's Errand", alt: "Fool's Errand", to: "/fools-errand", image: "/icons/Fools-Errand.png", textImage: "/icons/Fools-Errand-text.png" },
  { label: "Jalloseum", alt: "Jalloseum", to: "/jalloseum", image: "/icons/Jalloseum.png", textImage: "/icons/Jalloseum-text.png" },
  { label: "Art Gallery", alt: "Art Gallery", to: "/art-gallery", image: "/icons/Art-Gallery.png", textImage: "/icons/Art-Gallery-text.png" },
  { label: "Commissions", alt: "Commissions", to: "/commissions", image: "/icons/Commissions.png", textImage: "/icons/Commissions-text.png" },
  { label: "YouTube", alt: "YouTube", to: "https://youtube.com/@jallomoth", image: "/icons/YouTube.png", textImage: "/icons/YouTube-text.png" },
  { label: "Community", alt: "Community", to: "/community", image: "/icons/Community.png", textImage: "/icons/Community-text.png" },
  { label: "Patreon", alt: "Patreon", to: "https://www.patreon.com/Jallomoth", image: "/icons/Patreon.png", textImage: "/icons/Patreon-text.png" },
  { label: "Backstage", alt: "Backstage", to: "/backstage", image: "/icons/Backstage.png", textImage: "/icons/Backstage-text.png" },
];

function chunkButtons(buttons) {
  const rows = [];
  for (let i = 0; i < buttons.length; i += BUTTONS_PER_ROW) {
    rows.push(buttons.slice(i, i + BUTTONS_PER_ROW));
  }
  return rows;
}

export default function ButtonGrid() {
  const rows = chunkButtons(BUTTONS);

  return (
    <div className="button-grid">
      {rows.map((row, rowIndex) => (
        <ButtonRow key={rowIndex} buttons={row} />
      ))}
    </div>
  );
}
