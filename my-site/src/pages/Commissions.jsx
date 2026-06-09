// Commissions page — placeholder; content not yet implemented.
import './PlaceholderPage.css';
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import usePageTitle from "../hooks/usePageTitle";

export default function Commissions() {
  usePageTitle("Jallomoth — Commissions");

  return (
    <>
      <Logo className="subpage-logo" top="2rem" left="50%" width="clamp(18vw, 35vw, 35rem)" center={true} />
      <BackButton />
      <main className="page-content">
        <h1>Commissions</h1>
        <p>Coming soon...</p>
      </main>
    </>
  );
}