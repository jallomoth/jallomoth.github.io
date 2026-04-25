import './PlaceholderPage.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import usePageTitle from "../hooks/usePageTitle";

export default function Commissions() {
  usePageTitle("Jallomoth — Commissions");

  return (
    <>
      <Logo top="1.5vw" left="50%" width="20vw" center={true} />
      <BackButton />
      <main className="page-content">
        <h1>Commissions</h1>
        <p>Coming soon...</p>
      </main>
    </>
  );
}