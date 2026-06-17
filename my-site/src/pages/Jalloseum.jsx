// Jalloseum hub page — lists art sub-categories as navigation links.
// Each entry's `to` must match a route in App.jsx and its display label
// is shown directly on the link element.
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import JalloButton from "../components/buttons/JalloButton";
import usePageTitle from "../hooks/usePageTitle";
import "./Jalloseum.css";

const SUBPAGES = [
  { label: "Commissions",    to: "/jalloseum/commissions",   image: "/buttons/Jalloseum/J.COMMISSIONS.png" },
  { label: "Fool's Errand",  to: "/jalloseum/fools-errand",  image: "/buttons/Jalloseum/J.FOOLSERRAND.png" },
  { label: "Fan Art",        to: "/jalloseum/fan-art",        image: "/buttons/Jalloseum/J.FANART.png" },
  { label: "Thumbnails",     to: "/jalloseum/thumbnails",     image: "/buttons/Jalloseum/J.THUMBNAILS.png" },
  { label: "Jallologue",     to: "/jalloseum/jallologue",     image: "/buttons/Jalloseum/J.JALLOGUEFIX.png" },
  { label: "Fake Albums",    to: "/jalloseum/fake-albums",    image: "/buttons/Jalloseum/J.FAKEALBUMS.png" },
  { label: "Self Portraits", to: "/jalloseum/self-portraits", image: "/buttons/Jalloseum/J.SELFPORTRAITS.png" },
  { label: "Misc. & Memes",  to: "/jalloseum/misc",           image: "/buttons/Jalloseum/J.MISCANDMEMES.png" },
];

export default function Jalloseum() {
  usePageTitle("Jallomoth — Jalloseum");

  return (
    <>
      <Logo className="subpage-logo" top="2rem" left="50%" width="clamp(18vw, 35vw, 35rem)" center={true} />
      <BackButton />
      <main>
        <div className="jalloseum-hub-outer">
          <nav className="jalloseum-hub" aria-label="Jalloseum sections">
            {SUBPAGES.map(({ label, to, image }) => (
              <JalloButton key={to} to={to} image={image}>
                {label}
              </JalloButton>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}