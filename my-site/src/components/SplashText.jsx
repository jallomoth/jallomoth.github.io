// Minecraft-style splash text shown below the logo on the Home page.
// Picks a weighted-random entry from SPLASH_TEXTS on mount.
// Fades out when the logo is dragged far (body.logo-drag-far) or when
// the screensaver activates (body.screensaver-active) — both signalled
// via CSS class on document.body so no prop threading is needed.
import "./SplashText.css";

// ---------------------------------------------------------------------------
// Weighted splash text pool.
// Higher weight = more likely to appear. Weights are relative, not percent.
// ---------------------------------------------------------------------------
const SPLASH_TEXTS = [
  // --- Common ---
  { text: "Trans rights!",            weight: 8 },
  { text: "Heavily into birds",       weight: 6 },
  { text: "Now with 20% more bits!",  weight: 6 },
  { text: "Worm on a string!",        weight: 6 },
  { text: "Jallo said hi!",           weight: 5 },
  { text: "Touch grass (after this)", weight: 5 },
  { text: "Rated E for Everyone!",    weight: 5 },
  { text: "Made with ❤ and spite",    weight: 5 },
  { text: "Also try Minecraft!",      weight: 4 },
  { text: "Not affiliated with Mojang", weight: 4 },
  { text: "Screensaver included!",    weight: 4 },
  { text: "Now drag the logo",        weight: 4 },
  { text: "Drag the logo!",           weight: 4 },
  { text: "Click the logo!",          weight: 4 },
  { text: "Art goes here!",           weight: 4 },
  { text: "Honk!",                    weight: 3 },
  { text: "New high score!",          weight: 3 },
  { text: "It's a website!",          weight: 3 },
  { text: "Jallomoth dot com!",       weight: 3 },
  // --- Uncommon ---
  { text: "Secretly a cryptid",       weight: 2 },
  { text: "Buffering…",               weight: 2 },
  { text: "No refunds!",              weight: 2 },
  { text: "Open source (kinda)",      weight: 2 },
  { text: "Brain full of shapes",     weight: 2 },
  { text: "Bug or feature?",          weight: 2 },
  { text: "Runs on coffee",           weight: 2 },
  { text: "Stare into the void!",     weight: 2 },
  { text: "Hello there!",             weight: 2 },
  // --- Rare ---
  { text: "?????????????????",        weight: 0.5 },
  { text: "Wow!",                     weight: 0.5 },
  { text: "You found me!",            weight: 0.5 },
  { text: "Is this a Jojo reference?",weight: 0.5 },
  { text: "404 splash not found",     weight: 0.5 },
  { text: "Wake up, babe — new splash just dropped", weight: 0.3 },
];

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.text;
  }
  return items[items.length - 1].text;
}

// Stable selection for the session — pick once at module load time.
const sessionText = pickWeighted(SPLASH_TEXTS);

export default function SplashText() {
  return (
    <span className="splash-text" aria-hidden="true">
      {sessionText}
    </span>
  );
}
