import NavButton from "./NavButton";

export default function ButtonRow({ buttons }) {
  return (
    <div className="button-row">
      {buttons.map((btn, index) => (
        <NavButton key={index} {...btn} />
      ))}
    </div>
  );
}
