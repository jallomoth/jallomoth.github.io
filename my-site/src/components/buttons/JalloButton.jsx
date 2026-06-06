// Styled button used on the Jalloseum hub and anywhere else a "fancy nav"
// button is needed. Renders as a React Router <Link> when a `to` prop is
// supplied, or as a plain <button> when an `onClick` prop is supplied instead.
// Has an inner tiling parallax layer that mirrors the site background but
// moves in the opposite direction.
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useParallaxPos } from "../../contexts/ParallaxContext";
import useAnimationFrame from "../../hooks/useAnimationFrame";
import "./JalloButton.css";

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// How many pixels of parallax movement to allow — kept proportional to the
// main background so the two layers look like they belong together.
const STRENGTH = 15;

export default function JalloButton({ to, onClick, children, className = "", ...rest }) {
  const cls = `jalloseum-hub-link${className ? ` ${className}` : ""}`;

  const parallaxRef = useRef(null);
  const pos = useParallaxPos();

  // Per-instance random starting offset so each button looks different.
  // Using backgroundPosition rather than touching the transform keeps the
  // rAF math clean and the two concerns separate.
  const bgOffsetRef = useRef(null);
  if (bgOffsetRef.current === null) {
    bgOffsetRef.current = {
      x: Math.floor(Math.random() * 300),
      y: Math.floor(Math.random() * 300),
    };
  }

  // Drive the inner tile via backgroundPosition rather than transform so we
  // can use a truly unbounded offset (no modulo wrapping needed — the browser
  // handles tiling natively).  Negating pos gives the exact opposite motion to
  // backgroundPosition INCREASES with pos.x to move tiles RIGHT.
  // The site background element translates LEFT when pos.x is positive, making
  // its tiles appear to move LEFT.  Increasing backgroundPosition moves the
  // image origin right, which makes the pattern appear to move RIGHT — true
  // visual inversion of the site background.
  useAnimationFrame(() => {
    if (prefersReducedMotion || !parallaxRef.current) return;
    const tx = pos.current.x * STRENGTH + bgOffsetRef.current.x;
    const ty = pos.current.y * STRENGTH + bgOffsetRef.current.y;
    parallaxRef.current.style.backgroundPosition = `${tx}px ${ty}px`;
  });

  const parallaxLayer = (
    <span className="jallo-parallax-bg" aria-hidden="true">
      <span
        className="jallo-parallax-img"
        ref={parallaxRef}
      />
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {parallaxLayer}
        <span className="jallo-btn-content">{children}</span>
      </Link>
    );
  }

  return (
    <button type="button" className={cls} onClick={onClick} {...rest}>
      {parallaxLayer}
      <span className="jallo-btn-content">{children}</span>
    </button>
  );
}
