// Backstage page
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './Backstage.css';
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import JalloButton from "../components/buttons/JalloButton";
import usePageTitle from "../hooks/usePageTitle";

const CLICK_COUNT_KEY = "logo-click-count";

function getClickCount() {
  return parseInt(localStorage.getItem(CLICK_COUNT_KEY) || "0", 10);
}

export default function Backstage() {
  usePageTitle("Jallomoth — Backstage");

  const [clickCount, setClickCount] = useState(getClickCount);
  const [headingImgAvailable, setHeadingImgAvailable] = useState(true);

  // Keep the displayed count in sync when the Logo component fires a click.
  useEffect(() => {
    const handler = (e) => setClickCount(e.detail.count);
    window.addEventListener("logo-click-count-changed", handler);
    return () => window.removeEventListener("logo-click-count-changed", handler);
  }, []);

  const handleReset = () => {
    localStorage.removeItem(CLICK_COUNT_KEY);
    setClickCount(0);
  };

  return (
    <>
      <Logo top="20px" left="50%" width="35vw" center={true} />
      <BackButton />
      {/* Counter row (fixed, placed outside the masked scroll container so it's clickable) */}
      <div className="backstage-counter-row">
        <p>Logo clicks : <strong>{clickCount}</strong></p>
        <JalloButton className="backstage-reset-btn" onClick={handleReset}>Reset</JalloButton>
      </div>

      <div className="backstage-scroll">
        <main className="backstage-wrapper">

        {/* About section */}
        <h2 className="backstage-section-heading">About 
          <span className="backstage-heading-word">
            {headingImgAvailable ? (
              <img
                src="/logo-jallomoth-text.png"
                alt="JALLOMOTH"
                className="backstage-heading-img"
                onError={() => setHeadingImgAvailable(false)}
                onLoad={() => setHeadingImgAvailable(true)}
              />
            ) : (
              <span>JALLOMOTH</span>
            )}
          </span>
        </h2>
        <hr className="backstage-divider" />
        <div className="backstage-bio">
          {/* Replace src with the actual image path when ready */}
          <img
            className="backstage-bio-image"
            src=""
            alt="JALLOMOTH"
          />
          <div className="backstage-bio-text">
            <p>Jallomoth is the name of a heavy-handed , stout , bug-eyed , pink moth cryptid and illustrated mascot .
Obsessed with stories both real and fake , hypnotized by all things wonderous , he decided after many millennia that 
it was time to share his passions with the world . 
There was only one problem — who the hell would choose to use Adobe Premiere ?
Luckily for him , after haunting the acres of the Midwest , he found a young fool named Kincade — who sat up all night 
just afraid — of bugs , caves , and monkies , they called him junkie — so one day he ate a grenade .
But Luckily for HIM , someone intervened . And really , who better to enslave to a lifetime of editing and drawing pictures 
than a garish , anxiety-ridden , scoliosis-enfeebled , neuro-physiologically-imbalanced , heartburn-having , seizure-prone , 
casadastraphobic dyscalculoid ?
The turbulent marriage between Man and Moth was born , and ever since the pair have used their powers to ... to complain about bullshit on the internet ?

If you'd like to contact either party for any reason , be it a commission inqueery , digital fan-letter or anything in between , you can find out how <Link to="/community">here</Link>.</p>
          </div>
        </div>
        </main>
      </div>
      <div className="backstage-top-shield" />
    </>
  );
}