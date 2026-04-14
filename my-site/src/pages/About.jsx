import '../App.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";

export default function About() {
  return (
    <>
      <Logo />
      <BackButton />
      <div className="page-content">
        <h1>About</h1>
        <p>Coming soon...</p>
      </div>
    </>
  );
}