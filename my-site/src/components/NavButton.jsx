import "./NavButton.css";
import { useNavigate } from "react-router-dom";

export default function NavButton({ label, to, image }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to.startsWith('http')) {
      window.open(to, '_blank');
    } else {
      navigate(to);
    }
  };

  return (
    <div className="nav-button" onClick={handleClick}>
      <img src={image} alt={label} className="nav-button-image" />
    </div>
  );
}