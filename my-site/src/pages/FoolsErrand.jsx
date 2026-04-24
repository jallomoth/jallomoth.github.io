import { useEffect } from "react";
import '../App.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import ComicViewer from "../components/ComicViewer";

export default function FoolsErrand() {
  useEffect(() => {
    document.title = "Jallomoth — Fool's Errand";
  }, []);

  return (
    <>
      <Logo top="1.5vw" left="50%" width="20vw" center={true} />
      <BackButton />
      <div className="page-content" />

      <ComicViewer />
    </>
  );
}