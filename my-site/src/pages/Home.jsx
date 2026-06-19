// Home page — shows the site logo and the main navigation button grid.
// Background music starts on the first user interaction (browser autoplay policy).
// Screensaver: after SCREENSAVER_DELAY ms of inactivity on desktop, all nav
// buttons and the logo bounce around the viewport with elastic collision physics.
// Any mouse movement or keypress wakes everything back up.
import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import SplashText from "../components/SplashText";
import ButtonGrid from "../components/ButtonGrid";
import FullscreenButton from "../components/buttons/FullscreenButton";
import { useAudio } from "../contexts/AudioContext";
import usePageTitle from "../hooks/usePageTitle";

// Screensaver only on desktop (pointer: fine = mouse/trackpad, not touchscreen).
const IS_DESKTOP = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const SCREENSAVER_DELAY = 30_000; // ms of inactivity before screensaver activates

// Logo is entity index 8 in the screensaver array (buttons are 0–7).
const LOGO_SS_INDEX = 8;

export default function Home() {
  usePageTitle("Jallomoth");

  const { startMusic } = useAudio();
  useEffect(() => {
    startMusic();
    // intentionally no cleanup — music keeps playing as user navigates to subpages
  }, [startMusic]);

  // --- SCREENSAVER ---
  // ssRef holds the live physics state (null = inactive).
  // Using a ref (not state) for entity positions keeps the hot path at zero re-renders.
  const ssRef = useRef(null);
  const [screensaverActive, setScreensaverActive] = useState(false);
  const screensaverActiveRef = useRef(false);
  useEffect(() => { screensaverActiveRef.current = screensaverActive; }, [screensaverActive]);

  const timerRef = useRef(null);
  const logoFadeTimerRef = useRef(null);

  // Measure every [data-ss-index] element and initialize the physics entities.
  const activate = useCallback(() => {
    const nodes = Array.from(document.querySelectorAll("[data-ss-index]"))
      .sort((a, b) => Number(a.dataset.ssIndex) - Number(b.dataset.ssIndex));
    if (nodes.length === 0) return;

    const entities = nodes
      // Logo stays stationary — exclude it from the physics simulation.
      // Logo.jsx reads entities[LOGO_SS_INDEX]; undefined → spring to natural pos.
      .filter((el) => Number(el.dataset.ssIndex) !== LOGO_SS_INDEX)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const radius = Math.min(rect.width, rect.height) * 0.45;
        const speed = 2.5 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        return {
          x: cx, y: cy,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          naturalX: cx, naturalY: cy,
          radius,
        };
      });

    ssRef.current = { entities };
    setScreensaverActive(true);
    document.body.classList.add("screensaver-active");
    // Fade the logo out after 1 minute of screensaver inactivity.
    logoFadeTimerRef.current = setTimeout(() => {
      document.body.classList.add("logo-faded");
    }, 60_000);
  }, []);

  const deactivate = useCallback(() => {
    ssRef.current = null;
    setScreensaverActive(false);
    document.body.classList.remove("screensaver-active");
    clearTimeout(logoFadeTimerRef.current);
    document.body.classList.remove("logo-faded");
  }, []);

  // Inactivity timer — desktop only, registered once with stable callbacks.
  useEffect(() => {
    if (!IS_DESKTOP) return;

    const wake = () => {
      if (screensaverActiveRef.current) deactivate();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(activate, SCREENSAVER_DELAY);
    };

    wake(); // start the initial countdown
    window.addEventListener("mousemove", wake);
    // capture: true so wake fires before element mousedown handlers (prevents
    // drag starting while screensaver is still considered active).
    window.addEventListener("mousedown", wake, true);
    window.addEventListener("keydown", wake);

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("mousedown", wake, true);
      window.removeEventListener("keydown", wake);
    };
  }, [activate, deactivate]);

  // Bounce + elastic collision physics loop — raw rAF, no React re-renders in hot path.
  useEffect(() => {
    if (!screensaverActive) return;

    let lastTime = performance.now();
    let rafId;

    const loop = (now) => {
      const ss = ssRef.current;
      if (!ss) return;

      const dt = Math.min((now - lastTime) / (1000 / 60), 2);
      lastTime = now;

      const { entities } = ss;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Move + wall bounce
      for (const e of entities) {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.x - e.radius < 0)   { e.x = e.radius;      e.vx =  Math.abs(e.vx); }
        if (e.x + e.radius > vw)  { e.x = vw - e.radius; e.vx = -Math.abs(e.vx); }
        if (e.y - e.radius < 0)   { e.y = e.radius;      e.vy =  Math.abs(e.vy); }
        if (e.y + e.radius > vh)  { e.y = vh - e.radius; e.vy = -Math.abs(e.vy); }
      }

      // Elastic circle-circle collisions between all entity pairs
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const a = entities[i];
          const b = entities[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy;
          const minDist = a.radius + b.radius;
          if (distSq < minDist * minDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;
            // Push the two entities apart so they no longer overlap
            const overlap = (minDist - dist) * 0.5;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            // Exchange velocity components along the collision normal
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) { // only swap if they are actually approaching
              a.vx -= dot * nx;
              a.vy -= dot * ny;
              b.vx += dot * nx;
              b.vy += dot * ny;
            }
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [screensaverActive]);

  return (
    <>
      <Logo
        top="max(3%, 4vh)"
        left="50%"
        width="60vw"
        center={true}
        className="home-logo"
        ssRef={ssRef}
        ssIndex={LOGO_SS_INDEX}
      />
      <SplashText />
      <main>
        <ButtonGrid ssRef={ssRef} screensaverActive={screensaverActive} />
      </main>
      <FullscreenButton />
    </>
  );
}