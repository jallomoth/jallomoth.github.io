import '../App.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";

export default function Jalloseum() {
  return (
    <>
      <Logo top="1.5vw" left="50%" width="20vw" center={true} />
      <BackButton />
      <div className="page-content">
        <h1>Jalloseum</h1>
        <p>Coming soon...</p>
      </div>
    </>
  );
}