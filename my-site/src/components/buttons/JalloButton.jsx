// Styled button used on the Jalloseum hub and anywhere else a "fancy nav"
// button is needed. Renders as a React Router <Link> when a `to` prop is
// supplied, or as a plain <button> when an `onClick` prop is supplied instead.
import { Link } from "react-router-dom";
import "./JalloButton.css";

export default function JalloButton({ to, onClick, children, className = "", ...rest }) {
  const cls = `jalloseum-hub-link${className ? ` ${className}` : ""}`;

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
