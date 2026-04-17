import '../App.css';
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";

export default function ArtGallery() {
  return (
    <>
      <Logo top="1.5vw" left="17vw" width="20vw" center={true} />
      <BackButton />
      <div className="page-content">
        <h1>Art Gallery</h1>
        <p>Coming soon...</p>
      </div>
    </>
  );
}