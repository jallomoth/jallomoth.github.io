import NavButton from "./NavButton";
import "./ButtonGrid.css";

export default function ButtonRow({ buttons }) {
  return (
    <div className="button-row">
      {buttons.map((btn, index) => (
        <NavButton key={index} {...btn} />
      ))}
    </div>
  );
}
