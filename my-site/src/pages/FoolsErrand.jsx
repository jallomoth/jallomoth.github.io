import './PlaceholderPage.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import ComicViewer from "../components/ComicViewer";
import usePageTitle from "../hooks/usePageTitle";

export default function FoolsErrand() {
  usePageTitle("Jallomoth — Fool's Errand");

  return (
    <>
      <Logo top="1.5vw" left="50%" width="20vw" center={true} src="/logo/FoolsErrand.png" hoverSrc="/logo/FoolsErrand-hover.png" />
      <BackButton />
      <main>
        <ComicViewer />
      </main>
    </>
  );
}