import '../App.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";

export default function Commissions() {
  return (
    <>
      <Logo top="1.5vw" left="50%" width="20vw" center={true} />
      <BackButton />
      <div className="page-content">
        <h1>Commissions</h1>
        <p>Coming soon...</p>
      </div>
    </>
  );
}