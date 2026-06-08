// Backstage page
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './Backstage.css';
import { useAudio } from "../contexts/AudioContext";
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import JalloButton from "../components/buttons/JalloButton";
import usePageTitle from "../hooks/usePageTitle";
import InfoPopover from "../components/InfoPopover";

const CLICK_COUNT_KEY = "logo-click-count";

function getClickCount() {
  return parseInt(localStorage.getItem(CLICK_COUNT_KEY) || "0", 10);
}

export default function Backstage() {
  usePageTitle("Jallomoth — Backstage");

  const [clickCount, setClickCount] = useState(getClickCount);
  const [headingImgAvailable, setHeadingImgAvailable] = useState(true);
  const { playSound, effectiveVolume, muted } = useAudio();
  const [iconHovered, setIconHovered] = useState(false);
  const [iconPressed, setIconPressed] = useState(false);

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

  const [activeAction, setActiveAction] = useState(null);

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
                src="/logo/Jallogo.png"
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
            src="/misc/Portrait.png"
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

If you'd like to contact either party for any reason , be it a commission inqueery , digital fan-letter or anything in between , you can find out how <Link to="/community">here</Link> .</p>
          </div>
        </div>


        {/* Website section */}
        <h2 className="backstage-section-heading">About 
          <span className="backstage-heading-word">
            {headingImgAvailable ? (
              <img
                src="/logo/Jallogo.png"
                alt="JALLOMOTH"
                className="backstage-heading-img"
                onError={() => setHeadingImgAvailable(false)}
                onLoad={() => setHeadingImgAvailable(true)}
              />
            ) : (
              <span>Jallomoth.com</span>
            )}
          </span>
        </h2>
        <hr className="backstage-divider" />
        <div className="backstage-bio-text">
          <p className="backstage-bio-text-center">
            So you wanna know about the website , huh ? Hear from the old crone herself !
            <img
              src={
                  iconPressed ? "/buttons/volume/On-select.png" : iconHovered ? "/buttons/volume/On-hover.png" : "/buttons/volume/On.png"
              }
              alt="play sound"
              draggable="false"
              onClick={() => playSound('/sounds/misc/Website.mp3', effectiveVolume * 0.7)}
              onMouseEnter={() => setIconHovered(true)}
              onMouseLeave={() => { setIconHovered(false); setIconPressed(false); }}
              onMouseDown={() => setIconPressed(true)}
              onMouseUp={() => setIconPressed(false)}
              onTouchStart={() => setIconPressed(true)}
              onTouchEnd={() => setIconPressed(false)}
            />
          </p>
        </div>
        <div className="backstage-bio">
          {/* Replace src with the actual image path when ready */}
          <img
            className="backstage-bio-image"
            src="/images/evbg.png"
            alt="JALLOMOTH"
          />
          <div className="backstage-bio-text">
            <p>Jallomoth.com was hand-battered and fried by one evbg with love 💛 . An L. Ron-Hubbardian Cybergenius from on-high 
who has gone by over 10 brazillion names — from Xeno Yellow to 埃博格 . No one knows what planet he came from , 
but I think it got gentrified by some morally inferior aliens , so don't bring it up around him ok it's kind of a sore subject .
He coded the entire site in just under 13 hours with nothing but a steamdeck with Trove downloaded on it and a stylus fashioned 
out of the first ever tech deck produced in America & 2 and a half Sillybandz .
It's rumored that anyone who sees him in real life has a 1/600 chance to be petrified to stone — but if you're lucky ... and pure of heart 
... there's a chance his true form may be revealed to you .
If you encounter any bugs that need squashing or just have a trillion-dollar suggestion for the site to empower our swag and bolster our 
bitch count , you can reach out to the man behind the magic <button
              className="backstage-inline-action"
              onClick={() => setActiveAction({
                type: "links",
                label: "Find evbg",
                value: [
                  { label: "Discord", url: "https://discord.com/users/250777175593189377",    image: "/community/Jalloplaza Discord.png" },
                  { label: "Email",   url: "mailto:evinpbj@gmail.com",                        image: "/community/Email.png" },
                ],
              })}
            >here</button> .</p>
          </div>
        </div>
        {activeAction && (
          <InfoPopover action={activeAction} onClose={() => setActiveAction(null)} />
        )}
        </main>
      </div>
      <div className="backstage-top-shield" />
    </>
  );
}