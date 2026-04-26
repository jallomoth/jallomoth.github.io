import { useEffect } from "react";
import Logo from "../components/Logo";
import ButtonGrid from "../components/ButtonGrid";
import { useAudio } from "../components/audio/AudioContext";
import usePageTitle from "../hooks/usePageTitle";

export default function Home() {
  usePageTitle("Jallomoth");

  const { startMusic } = useAudio();

  useEffect(() => {
    startMusic();
    // intentionally no cleanup — music keeps playing as user navigates to subpages
  }, [startMusic]);

  return (
    <>
      <Logo top="max(5%, 6vh)" left="50%" width="60vw" center={true} className="home-logo" />
      <main>
        <ButtonGrid />
      </main>
    </>
  );
}