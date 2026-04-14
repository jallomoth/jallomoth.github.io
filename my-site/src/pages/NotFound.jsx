import '../App.css';
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <>
      <Logo />
      <div className="page-content">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    </>
  );
}