// Fool's Errand page — hosts the comic reader (ComicViewer).
// Wrapped in an ErrorBoundary so a broken chapter does not crash the whole page.
import './PlaceholderPage.css';
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import ComicViewer from "../components/ComicViewer";
import ErrorBoundary from "../components/ErrorBoundary";
import usePageTitle from "../hooks/usePageTitle";

export default function FoolsErrand() {
  usePageTitle("Jallomoth — Fool's Errand");

  return (
    <>
      <Logo className="subpage-logo" top="0rem" left="50%" width="clamp(16vw, 30vw, 30rem)" center={true} src="/logo/FoolsErrand.png" hoverSrc="/logo/FoolsErrand-hover.png" />
      <BackButton />
      <main>
        <ErrorBoundary>
          <ComicViewer />
        </ErrorBoundary>
      </main>
    </>
  );
}