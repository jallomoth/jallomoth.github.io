import { useEffect } from "react";
import "../App.css";
import Logo from "../components/Logo";
import ButtonGrid from "../components/ButtonGrid";
import { useAudio } from "../components/AudioContext";

export default function Home() {
  const { startMusic, stopMusic } = useAudio();

  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, [startMusic, stopMusic]);

  return (
    <>
      <Logo />
      <ButtonGrid />
    </>
  );
}