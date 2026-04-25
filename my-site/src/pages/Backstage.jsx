import '../App.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import usePageTitle from "../hooks/usePageTitle";

export default function Backstage() {
  usePageTitle("Jallomoth — Backstage");

  return (
    <>
      <Logo top="1.5vw" left="50%" width="20vw" center={true} />
      <BackButton />
      <div className="page-content">
        <h1>Backstage</h1>
        <p>Coming soon...</p>
      </div>
    </>
  );
}