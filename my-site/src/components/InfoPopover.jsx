import { useEffect, useRef, useState } from "react";
import "./InfoPopover.css";

const EXIT_DURATION = 180; // ms — must match CSS animation duration

export default function InfoPopover({ action, onClose }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [closeState, setCloseState] = useState("normal");
  const overlayRef = useRef(null);
  const closeRef = useRef(null);

  // Trigger enter transition on the next frame (matches gallery modal pattern)
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Trigger exit animation, then unmount
  const requestClose = () => {
    if (exiting) return;
    setExiting(true);
    setVisible(false); // removes --visible → transition plays in reverse
    setTimeout(onClose, EXIT_DURATION);
  };

  // Focus close button on mount so keyboard users can immediately dismiss
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [exiting]);

  // Close when clicking the overlay backdrop (not the card itself)
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) requestClose();
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(action.value);
      } else {
        // Fallback for older browsers / insecure contexts
        const ta = document.createElement("textarea");
        ta.value = action.value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail — user still sees the value displayed
    }
  };

  const openAction = () => {
    if (action.type === "mailto") {
      window.location.href = `mailto:${action.value}`;
    } else if (action.type === "address") {
      // Normalize newlines and extra whitespace so the map query is clean
      const normalized = action.value.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
      const query = encodeURIComponent(normalized);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const actionLabel =
    action.type === "mailto" ? "Open in Mail" : "Open in Maps";

  return (
    <div
      ref={overlayRef}
      className={`info-popover-overlay${visible ? " info-popover-overlay--visible" : ""}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={action.label}
    >
      {/* ARIA live region announces copy confirmation to screen readers */}
      <div aria-live="polite" className="info-popover-sr-live">
        {copied ? "Copied to clipboard!" : ""}
      </div>

      <div className={`info-popover-card${exiting ? " info-popover-card--exit" : ""}`}>
        <button
          ref={closeRef}
          className="info-popover-close"
          onClick={requestClose}
          onMouseEnter={() => setCloseState("hover")}
          onMouseLeave={() => setCloseState("normal")}
          onMouseDown={() => setCloseState("press")}
          onMouseUp={() => setCloseState("hover")}
          aria-label="Close"
        >
          <img
            src={
              closeState === "press" ? "/buttons/x/x-press.png"
              : closeState === "hover" ? "/buttons/x/x-hover.png"
              : "/buttons/x/x.png"
            }
            alt=""
            className="info-popover-close-img"
            draggable="false"
          />
        </button>

        <p className="info-popover-title">{action.label}</p>
        <p className="info-popover-value">{action.value}</p>

        <div className="info-popover-actions">
          <button
            className="info-popover-btn info-popover-btn--copy"
            onClick={copyToClipboard}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            className="info-popover-btn info-popover-btn--open"
            onClick={openAction}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
