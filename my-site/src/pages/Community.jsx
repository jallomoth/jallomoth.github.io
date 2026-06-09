// Community page — social/external links, plus a popover for actions that
// cannot simply open a URL (email and P.O. box).
import { useState } from "react";
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import CommunityButtonGrid from "../components/CommunityButtonGrid";
import InfoPopover from "../components/InfoPopover";
import usePageTitle from "../hooks/usePageTitle";
import "./Community.css";

export default function Community() {
  usePageTitle("Jallomoth — Community");
  const [activeAction, setActiveAction] = useState(null);

  return (
    <>
      <Logo className="subpage-logo" top="2rem" left="50%" width="clamp(18vw, 35vw, 35rem)" center={true} />
      <BackButton />
      <main className="community-main">
        <CommunityButtonGrid onAction={setActiveAction} />
      </main>

      {activeAction && (
        <InfoPopover
          action={activeAction}
          onClose={() => setActiveAction(null)}
        />
      )}
    </>
  );
}