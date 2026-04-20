import { useEffect } from "react";
import "../App.css";
import Logo from "../components/Logo";
import ButtonGrid from "../components/ButtonGrid";
import { useAudio } from "../components/audio/AudioContext";

export default function Home() {
    useEffect(() => {
      document.title = "Jallomoth";
    }, []);

  const { startMusic, stopMusic } = useAudio();

  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, [startMusic, stopMusic]);

  return (
    <>
      <Logo top="5%" left="50%" width="60vw" center={true} />
      <ButtonGrid />
    </>
  );
}