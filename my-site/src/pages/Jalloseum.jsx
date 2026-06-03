// Jalloseum hub page — lists art sub-categories as navigation links.
// Each entry's `to` must match a route in App.jsx and its display label
// is shown directly on the link element.
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import JalloButton from "../components/buttons/JalloButton";
import usePageTitle from "../hooks/usePageTitle";
import "./Jalloseum.css";

const SUBPAGES = [
  { label: "Commissions",    to: "/jalloseum/commissions" },
  { label: "Fool's Errand",  to: "/jalloseum/fools-errand" },
  { label: "Fan Art",        to: "/jalloseum/fan-art" },
  { label: "Thumbnails",     to: "/jalloseum/thumbnails" },
  { label: "Jallologue",     to: "/jalloseum/jallologue" },
  { label: "Fake Albums",    to: "/jalloseum/fake-albums" },
  { label: "Self Portraits", to: "/jalloseum/self-portraits" },
  { label: "Misc. & Memes",  to: "/jalloseum/misc" },
];

export default function Jalloseum() {
  usePageTitle("Jallomoth — Jalloseum");

  return (
    <>
      <Logo top="20px" left="50%" width="35vw" center={true} />
      <BackButton />
      <main>
        <div className="jalloseum-hub-outer">
          <nav className="jalloseum-hub" aria-label="Jalloseum sections">
            {SUBPAGES.map(({ label, to }) => (
              <JalloButton key={to} to={to} style={{ "--jallo-btn-height": "80px" }}>
                {label}
              </JalloButton>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}