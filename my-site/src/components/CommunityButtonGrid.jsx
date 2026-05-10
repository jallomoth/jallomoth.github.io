import "./CommunityButtonGrid.css";
import NavButton from "./NavButton";

const COMMUNITY_BUTTONS = [
  { label: "Jallomoth Channel",   alt: "Jallomoth Channel",   to: "https://youtube.com/@jallomoth", image: "/community/Jallomoth Channel.png" },
  { label: "Jallomoth UNTUCKED",  alt: "Jallomoth UNTUCKED",  to: "https://youtube.com/@jallomoth2", image: "/community/Jallomoth UNTUCKED.png" },
  { label: "Jalloplaza Discord",  alt: "Jalloplaza Discord",  to: "https://discord.gg/jallomoth", image: "/community/Jalloplaza Discord.png" },
  {
    label: "Email",
    alt: "Email",
    to: null,
    image: "/community/Email.png",
    action: { type: "mailto", value: "jallomoth@gmail.com", label: "Email" },
  },
  { label: "Jallomoth Instagram", alt: "Jallomoth Instagram", to: "https://instagram.com/jallomoth", image: "/community/Jallomoth Instagram.png" },
  { label: "Personal Instagram",  alt: "Personal Instagram",  to: "https://instagram.com/kincade.gif", image: "/community/Personal Instagram.png" },
  { label: "Plasticamra",         alt: "Plasticamra",         to: "https://instagram.com/plasticamra", image: "/community/Plasticamra.png" },
  { label: "Twitter",             alt: "Twitter",             to: "https://x.com/jallomoth", image: "/community/Twitter.png" },
  { label: "TikTok",              alt: "TikTok",              to: "https://tiktok.com/@jallomoth", image: "/community/TikTok.png" },
  { label: "Letterboxd",          alt: "Letterboxd",          to: "https://letterboxd.com/jallomoth/", image: "/community/Letterboxd.png" },
  {
    label: "P.O. Box",
    alt: "P.O. Box",
    to: null,
    image: "/community/P.O. Box.png",
    action: { type: "address", value: `Jallomoth
424 S. Michigan St.
P.O. Box # 4191
South Bend, IN. 46544`, label: "P.O. Box" },
  },
  { label: "Patreon",             alt: "Patreon",             to: "https://patreon.com/jallomoth", image: "/community/Patreon.png" },
];

export default function CommunityButtonGrid({ onAction }) {
  return (
    <div className="community-button-grid">
      {COMMUNITY_BUTTONS.map((btn, index) => (
        <NavButton
          key={index}
          {...btn}
          textLabel={btn.label}
          onAction={btn.action ? () => onAction(btn.action) : undefined}
        />
      ))}
    </div>
  );
}
