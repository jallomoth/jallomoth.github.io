import "./ButtonGrid.css";
import ButtonRow from "./ButtonRow";

const BUTTONS_PER_ROW = 4;

function chunkButtons(buttons) {
  const rows = [];
  for (let i = 0; i < buttons.length; i += BUTTONS_PER_ROW) {
    rows.push(buttons.slice(i, i + BUTTONS_PER_ROW));
  }
  return rows;
}

export default function ButtonGrid() {
  const buttons = [
    { label: "Fool's Errand", alt: "Fool's Errand", to: "/fools-errand", image: "/icons/Fools-Errand.png" },
    { label: "Jalloseum", alt: "Jalloseum", to: "/jalloseum", image: "/icons/Jalloseum.png" },
    { label: "Art Gallery", alt: "Art Gallery", to: "/art-gallery", image: "/icons/Art-Gallery.png" },
    { label: "Commissions", alt: "Commissions", to: "/commissions", image: "/icons/Commissions.png" },
    { label: "YouTube", alt: "YouTube", to: "https://youtube.com/@jallomoth", image: "/icons/YouTube.png" },
    { label: "Community", alt: "Community", to: "/community", image: "/icons/Community.png" },
    { label: "Patreon", alt: "Patreon", to: "https://www.patreon.com/Jallomoth", image: "/icons/Patreon.png" },
    { label: "Backstage", alt: "Backstage", to: "/backstage", image: "/icons/Backstage.png" },
  ];

  const rows = chunkButtons(buttons);

  return (
    <div className="button-grid">
      {rows.map((row, rowIndex) => (
        <ButtonRow key={rowIndex} buttons={row} />
      ))}
    </div>
  );
}
