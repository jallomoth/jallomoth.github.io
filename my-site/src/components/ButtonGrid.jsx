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
    { label: "Fool's Errand", to: "/fools-errand", image: "/images/fools-errand.png" },
    { label: "Art Gallery", to: "/art-gallery", image: "/images/art-gallery.png" },
    { label: "Patreon", to: "https://www.patreon.com/Jallomoth", image: "/images/patreon.png" },
    { label: "Youtube", to: "https://youtube.com/@jallomoth", image: "/images/youtube.png" },
    { label: "Jalloseum", to: "/jalloseum", image: "/images/jalloseum.png" },
    { label: "About", to: "/about", image: "/images/about.png" },
    { label: "Commissions", to: "/commissions", image: "/images/commissions.png" },
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
