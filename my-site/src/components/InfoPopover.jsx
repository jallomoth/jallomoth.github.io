import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./InfoPopover.css";

const EXIT_DURATION = 180; // ms — must match CSS animation duration

/*
  NOTE (why blur sometimes broke in production):

  Background: The InfoPopover overlay uses `backdrop-filter` to blur
  content behind the modal. This works locally, but in production builds a
  combination of CSS minification, bundling, and certain animations can
  cause the blur to stop working.

  Root causes we've observed and guarded against here:
  - Minifier bug: `blur(0px)` in the "hidden" state can be rewritten by
    some postcss/minifiers to `blur()` (missing argument), which makes the
    `-webkit-backdrop-filter` declaration invalid and the browser ignores
    the whole property. Fix: use `none` for the hidden state and include
    an explicit `-webkit-backdrop-filter` value for the visible state.

  - Extraction/optimization: some bundlers only keep vendor-prefixed
    properties if they're present in certain rules; writing the critical
    backdrop-filter values directly to the overlay DOM node (inline
    styles) ensures they survive extraction and appear at runtime.

  - Compositing/animation interaction: running `@keyframes` animations on
    descendants of an element that has `backdrop-filter` can promote a
    compositor layer that prevents sampling the page behind the overlay
    (Chrome/Safari quirk). Fix: use `transition` for overlay/card enter/exit
    animations and avoid continuous keyframe animations inside the overlay
    (or pause them by default and only run on hover).

  - Portal placement: the overlay must be rendered at the top-level (e.g.
    `document.body`) so it can sample the page behind it — `createPortal`
    is used for this.

  What we changed in this file to address the above:
  - Render via `createPortal` into `document.body`.
  - Use `requestAnimationFrame` + timeout fallback to toggle the visible
    class, matching the gallery modal pattern (avoids running animations
    immediately on mount and ensures transitions run).
  - Write `backdrop-filter` and `-webkit-backdrop-filter` values directly
    to the overlay DOM node in `useEffect` so production CSS extraction
    cannot remove them.

  Future checklist if blur stops working again:
  - Inspect compiled CSS for `-webkit-backdrop-filter: blur();` (invalid)
  - Ensure hidden state uses `none` (not `blur(0px)`)
  - Confirm overlay is portaled to `document.body`
  - Search for `@keyframes` or continuous `animation:` on overlay
    descendants — pause or convert to `transition` if present
  - If needed, set inline styles on the overlay as a last-resort fix.

*/

export default function InfoPopover({ action, onClose }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [closeState, setCloseState] = useState("normal");
  const overlayRef = useRef(null);
  const closeRef = useRef(null);

  const overlayStyle = {
    background: visible ? "rgba(0, 0, 0, 0.55)" : "rgba(0, 0, 0, 0)",
    backdropFilter: visible ? "blur(10px) saturate(120%)" : "none",
    WebkitBackdropFilter: visible ? "blur(10px) saturate(120%)" : "none",
  };

  // Ensure inline styles are applied directly to the DOM node so production
  // CSS minification / extraction cannot remove backdrop-filter. This
  // mirrors the style object but writes it directly to the element.
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    el.style.background = visible ? "rgba(0, 0, 0, 0.55)" : "rgba(0, 0, 0, 0)";
    // set both standard and WebKit-prefixed properties on the style object
    try {
      el.style.backdropFilter = visible ? "blur(10px) saturate(120%)" : "none";
    } catch (e) {}
    try {
      el.style.WebkitBackdropFilter = visible ? "blur(10px) saturate(120%)" : "none";
    } catch (e) {}
  }, [visible]);

  // Trigger enter transition on the next frame (matches gallery modal pattern)
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    // Fallback for environments where rAF may be paused or delayed
    const t = setTimeout(() => setVisible(true), 60);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(t);
    };
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

  // ---- text type --------------------------------------------------------
  if (action.type === "text") {
    return createPortal(
      (
        <div
          ref={overlayRef}
          style={overlayStyle}
          className={`info-popover-overlay${visible ? " info-popover-overlay--visible" : ""}`}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label={action.label}
        >
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
                  closeState === "press" ? "/buttons/x/X-select.png"
                  : closeState === "hover" ? "/buttons/x/X-hover.png"
                  : "/buttons/x/X.png"
                }
                alt=""
                className="info-popover-close-img"
                draggable="false"
              />
            </button>
            <p className="info-popover-title">{action.label}</p>
            <p className="info-popover-value info-popover-value--text">{action.value}</p>
            {action.copyable !== false && (
              <div className="info-popover-actions">
                <button className="info-popover-btn info-popover-btn--copy" onClick={copyToClipboard}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
      ),
      document.body
    );
  }

  // ---- links type -------------------------------------------------------
  // action.value: Array<{ label: string, url: string, image?: string }>
  if (action.type === "links") {
    return createPortal(
      (
        <div
          ref={overlayRef}
          style={overlayStyle}
          className={`info-popover-overlay${visible ? " info-popover-overlay--visible" : ""}`}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label={action.label}
        >
          <div className={`info-popover-card info-popover-card--links${exiting ? " info-popover-card--exit" : ""}`}>
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
                  closeState === "press" ? "/buttons/x/X-select.png"
                  : closeState === "hover" ? "/buttons/x/X-hover.png"
                  : "/buttons/x/X.png"
                }
                alt=""
                className="info-popover-close-img"
                draggable="false"
              />
            </button>
            <p className="info-popover-title">{action.label}</p>
            <ul className="info-popover-links">
              {action.value.map((link) => (
                <li key={link.url} className="info-popover-link-item">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-popover-link"
                  >
                    {link.image && (
                      <img
                        src={link.image}
                        alt=""
                        className="info-popover-link-icon"
                        draggable="false"
                      />
                    )}
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
      document.body
    );
  }

  return createPortal(
    (
      <div
        ref={overlayRef}
        style={overlayStyle}
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
                closeState === "press" ? "/buttons/x/X-select.png"
                : closeState === "hover" ? "/buttons/x/X-hover.png"
                : "/buttons/x/X.png"
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
    ),
    document.body
  );
}
