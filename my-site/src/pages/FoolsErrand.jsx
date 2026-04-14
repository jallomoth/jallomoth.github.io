import '../App.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";

export default function FoolsErrand() {
  return (
    <>
      <Logo />
      <BackButton />
      <div className="page-content">
        <h1>Fool's Errand</h1>
        <p>Coming soon...</p>
      </div>
    </>
  );
}