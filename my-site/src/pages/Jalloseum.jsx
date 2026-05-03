import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
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
              <Link key={to} to={to} className="jalloseum-hub-link">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}