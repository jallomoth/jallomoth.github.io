import '../App.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";

export default function Jalloseum() {
  return (
    <>
      <Logo />
      <BackButton />
      <div className="page-content">
        <h1>Jalloseum</h1>
        <p>Coming soon...</p>
      </div>
    </>
  );
}