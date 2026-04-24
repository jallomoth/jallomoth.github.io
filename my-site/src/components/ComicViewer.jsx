import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import chapters from "../data/foolsErrand";
import "./ComicViewer.css";

export default function ComicViewer() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const containerRef = useRef(null);
  const menuRef      = useRef(null);
  const imgRef       = useRef(null);
  const fsCursorRef  = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);

  // derive chapter + page from URL
  const { pageIndex, chapter } = useMemo(() => {
    const raw    = location.pathname.replace(/^\/fools-errand\/?/, "");
    const parts  = raw.split("/").filter(Boolean);
    const chapId = parts[0] || chapters[0].id;
    const page   = parts[1] ? Math.max(1, parseInt(parts[1], 10) || 1) : 1;
    const chapMeta = chapters.find((c) => c.id === chapId) || chapters[0];
    return { pageIndex: page - 1, chapter: chapMeta };
  }, [location.pathname]);

  // redirect bare /fools-errand to first chapter page 1
  useEffect(() => {
    if (
      location.pathname === "/fools-errand" ||
      location.pathname === "/fools-errand/"
    ) {
      navigate(`/fools-errand/${chapters[0].id}/1`, { replace: true });
    }
  }, [location.pathname, navigate]);

  const total = chapter.images.length;

  const goTo = (cId, idx) => {
    const c    = chapters.find((ch) => ch.id === cId) || chapters[0];
    const page = Math.max(1, Math.min(idx + 1, c.images.length));
    navigate(`/fools-errand/${c.id}/${page}`);
  };

  const next = () => { if (pageIndex + 1 < total) goTo(chapter.id, pageIndex + 1); };
  const prev = () => { if (pageIndex > 0)          goTo(chapter.id, pageIndex - 1); };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pageIndex, chapter]);

  // fullscreen listener
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // preload adjacent pages to eliminate switching lag
  useEffect(() => {
    const toPreload = [
      chapter.images[pageIndex + 1],
      chapter.images[pageIndex - 1],
    ].filter(Boolean);
    toPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [chapter, pageIndex]);

  // fullscreen cursor: track mouse inside fullscreen element
  useEffect(() => {
    if (!isFullscreen) return;
    let frame;
    const pos = { x: -200, y: -200 };
    let visible = false;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      visible = true;
    };
    const animate = () => {
      if (fsCursorRef.current) {
        fsCursorRef.current.style.opacity = visible ? "1" : "0";
        fsCursorRef.current.style.transform =
          `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    animate();
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) await containerRef.current.requestFullscreen();
      else                              await document.exitFullscreen();
    } catch (err) {
      console.warn("fullscreen failed", err);
    }
  };

  return (
    <div
      className={`comic-container${isFullscreen ? " is-fullscreen" : ""}`}
      ref={containerRef}
      style={isFullscreen ? { paddingTop: 0 } : undefined}
    >

      {/* fullscreen cursor (visible only in fullscreen since .custom-cursor img is outside the FS layer) */}
      {isFullscreen && (
        <img
          ref={fsCursorRef}
          src="/cursor/Cursor.png"
          alt=""
          draggable={false}
          style={{
            position: "fixed",
            top: "1.2vw",
            left: "0.65vw",
            width: "3.5vw",
            pointerEvents: "none",
            zIndex: 99999,
            opacity: 0,
            userSelect: "none",
          }}
        />
      )}

      {/* topbar: chapter dropdown left, page count + fullscreen right */}
      <div className="comic-topbar">
        <div className="topbar-left" ref={menuRef}>
          <button
            className="chapter-toggle"
            onClick={() => setMenuOpen((s) => !s)}
            aria-expanded={menuOpen}
          >
            {chapter.label} ▾
          </button>

          {menuOpen && (
            <div className="chapter-list">
              {chapters.map((c) => (
                <button
                  key={c.id}
                  className={`chapter-item${c.id === chapter.id ? " active" : ""}`}
                  onClick={() => { setMenuOpen(false); navigate(`/fools-errand/${c.id}/1`); }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="topbar-right">
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            {isFullscreen ? "✕ Exit" : "⛶ Fullscreen"}
          </button>
        </div>
      </div>

      {/* comic stage: fills remaining height, image centered */}
      <div className="comic-stage">
        <div className="image-wrap">
          <button className="nav prev" onClick={prev} aria-label="Previous page">‹</button>

          <img
            ref={imgRef}
            src={chapter.images[pageIndex]}
            alt={`${chapter.label} — page ${pageIndex + 1}`}
            className="comic-image"
          />

          <button className="nav next" onClick={next} aria-label="Next page">›</button>
        </div>

        <div className="page-indicator-below">{pageIndex + 1} / {total}</div>
      </div>

    </div>
  );
}
