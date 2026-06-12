// Comic reader — URL-driven page viewer for Fool's Errand chapters.
// Chapter and page are derived from the URL path so links are shareable.
// Reading position is persisted to localStorage and restored on next visit.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import chapters from "../data/foolsErrand";
import { useAudio } from "../contexts/AudioContext";
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
  const [prevState,    setPrevState]    = useState("normal");
  const [nextState,    setNextState]    = useState("normal");
  const [imageLoaded,  setImageLoaded]  = useState(false);

  const { effectiveVolume, playSound, switchMusic } = useAudio();

  // --- URL PARSING ---
  // Derive chapter and page index from the URL path so the reader state is
  // fully encoded in the URL and the back button works correctly.
  const { pageIndex, chapter } = useMemo(() => {
    const raw    = location.pathname.replace(/^\/fools-errand\/?/, "");
    const parts  = raw.split("/").filter(Boolean);
    const chapId = parts[0] || chapters[0].id;
    const page   = parts[1] ? Math.max(1, parseInt(parts[1], 10) || 1) : 1;
    const chapMeta = chapters.find((c) => c.id === chapId) || chapters[0];
    return { pageIndex: page - 1, chapter: chapMeta };
  }, [location.pathname]);

  // --- CHAPTER MUSIC ---
  // Switch to chapter-specific music when the chapter changes.
  // Falls back to home music for chapters without a music field.
  // Restores home music when the component unmounts (user leaves the page).
  useEffect(() => {
    switchMusic(chapter.music || "/music/home.mp3");
  }, [chapter.id]);

  useEffect(() => {
    return () => { switchMusic("/music/home.mp3"); };
  }, []);

  // --- RESTORE SAVED POSITION ---
  // On a bare /fools-errand visit, redirect to the last-read page if one
  // exists and the chapter is still valid, otherwise go to chapter 1 page 1.
  useEffect(() => {
    if (
      location.pathname === "/fools-errand" ||
      location.pathname === "/fools-errand/"
    ) {
      try {
        const saved = JSON.parse(localStorage.getItem("fe-last-read"));
        if (saved?.chapterId && saved?.page != null) {
          const validChapter = chapters.find((c) => c.id === saved.chapterId);
          if (validChapter) {
            navigate(`/fools-errand/${saved.chapterId}/${saved.page + 1}`, { replace: true });
            return;
          }
        }
      } catch { /* ignore bad localStorage */ }
      navigate(`/fools-errand/${chapters[0].id}/1`, { replace: true });
    }
  }, [location.pathname, navigate]);

  // --- NAVIGATION HELPERS ---
  const total = chapter.images.length;

  const goTo = (cId, idx) => {
    const c    = chapters.find((ch) => ch.id === cId) || chapters[0];
    const page = Math.max(1, Math.min(idx + 1, c.images.length));
    navigate(`/fools-errand/${c.id}/${page}`);
  };

  const next = () => { if (pageIndex + 1 < total) goTo(chapter.id, pageIndex + 1); };
  const prev = () => { if (pageIndex > 0)          goTo(chapter.id, pageIndex - 1); };

  // Build the nav button image path from a base name and interaction state.
  const navImg = (base, state) => {
    if (state === "hover")  return `/buttons/comic/${base}-hover.png`;
    if (state === "click")  return `/buttons/comic/${base}-select.png`;
    return `/buttons/comic/${base}.png`;
  };

  // Returns mouse event handlers that drive a button's visual state and
  // trigger navigation + sound on mouseup.
  const makeNavHandlers = (disabled, action, setState) => ({
    onMouseEnter: ()  => { if (!disabled) setState("hover"); },
    onMouseLeave: ()  => setState("normal"),
    onMouseDown:  ()  => { if (!disabled) setState("click"); },
    onMouseUp:    ()  => {
      if (!disabled) {
        setState("hover");
        playSound("/sounds/misc/Click.mp3", effectiveVolume * 0.2);
        action();
      }
    },
  });

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- KEYBOARD NAVIGATION ---
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pageIndex, chapter]);

  // --- FULLSCREEN LISTENER ---
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // --- PAGE PRELOADING ---
  // Preload adjacent pages so navigation feels instant. When on the last page,
  // also preload the first image of the next chapter so the chapter transition
  // has no visible loading delay.
  useEffect(() => {
    const chapterIndex = chapters.findIndex((c) => c.id === chapter.id);
    const nextChapter  = chapters[chapterIndex + 1];
    const isLastPage   = pageIndex + 1 >= chapter.images.length;

    const toPreload = [
      chapter.images[pageIndex + 1],
      chapter.images[pageIndex - 1],
      isLastPage && nextChapter ? nextChapter.images[0] : null,
    ].filter(Boolean);

    toPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [chapter, pageIndex]);

  // --- PERSIST READING POSITION ---
  useEffect(() => {
    localStorage.setItem("fe-last-read", JSON.stringify({ chapterId: chapter.id, page: pageIndex }));
  }, [chapter.id, pageIndex]);

  // --- PAGE SOUNDS ---
  // Play a chapter-specific sound when landing on a particular page.
  // The manifest maps 1-based page numbers (as string keys) to sound paths.
  useEffect(() => {
    const sound = chapter.pageSounds?.[String(pageIndex + 1)];
    if (sound) playSound(sound, effectiveVolume);
  }, [chapter.id, pageIndex]);

  // --- ANALYTICS ---
  // Fire a GA event for each page read so chapter engagement is trackable.
  useEffect(() => {
    ReactGA.event({
      category: "Comic",
      action: "page_read",
      label: `${chapter.id} — page ${pageIndex + 1}`,
    });
  }, [chapter.id, pageIndex]);

  // --- TOUCH SWIPE ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0;
    const onTouchStart = (e) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx < -50) next();
      if (dx > 50)  prev();
    };
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchend",   onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [pageIndex, chapter]);

  // --- FULLSCREEN CURSOR ---
  // The site-wide custom cursor element is outside the fullscreen container,
  // so it disappears in fullscreen mode. We render a duplicate cursor inside.
  useEffect(() => {
    if (!isFullscreen) return;
    let frame;
    const pos = { x: -200, y: -200 };
    const onMove = (e) => { pos.x = e.clientX; pos.y = e.clientY; };
    const animate = () => {
      if (fsCursorRef.current) {
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
      {isFullscreen ? (
        // fullscreen: only the image + invisible left/right click zones + custom cursor
        <>
          <img
            ref={imgRef}
            src={chapter.images[pageIndex]}
            alt={`${chapter.label} — page ${pageIndex + 1}`}
            className="fs-image"
          />
          <button className="fs-zone fs-zone-prev" onClick={prev} aria-label="Previous page" />
          <button className="fs-zone fs-zone-next" onClick={next} aria-label="Next page" />
          <img
            ref={fsCursorRef}
            src="/cursor/Cursor.png"
            alt=""
            draggable={false}
            className="fs-cursor"
          />
        </>
      ) : (
        // normal mode: topbar + stage
        <>
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

            <div className="topbar-center">{chapter.pageTitle}</div>

            <div className="topbar-right">
              {(() => {
                const chapterIndex = chapters.findIndex((c) => c.id === chapter.id);
                const hasPrev = chapterIndex > 0;
                const hasNext = chapterIndex < chapters.length - 1;
                return (
                  <>
                    <button
                      className={`chapter-nav-btn${!hasPrev ? " disabled" : ""}`}
                      disabled={!hasPrev}
                      onClick={() => hasPrev && navigate(`/fools-errand/${chapters[chapterIndex - 1].id}/1`)}
                      aria-label="Previous chapter"
                    >‹ Prev Chapter</button>
                    <button
                      className={`chapter-nav-btn${!hasNext ? " disabled" : ""}`}
                      disabled={!hasNext}
                      onClick={() => hasNext && navigate(`/fools-errand/${chapters[chapterIndex + 1].id}/1`)}
                      aria-label="Next chapter"
                    >Next Chapter ›</button>
                  </>
                );
              })()}
              <button className="fullscreen-btn" onClick={toggleFullscreen}>
                {"⛶ Fullscreen"}
              </button>
            </div>
          </div>

          <div className="comic-stage">
            <button
              className={`nav prev${pageIndex === 0 ? " disabled" : ""}`}
              disabled={pageIndex === 0}
              aria-label="Previous page"
              {...makeNavHandlers(pageIndex === 0, prev, setPrevState)}
            >
              <img
                src={navImg("Prev", pageIndex === 0 ? "normal" : prevState)}
                alt=""
                draggable={false}
                className="nav-img"
              />
            </button>

            <div className="stage-center">
              <div className="image-wrap">
                  {!imageLoaded && <div className="comic-placeholder" />}
                  <img
                    key={`${chapter.id}-${pageIndex}`}
                    ref={imgRef}
                    src={chapter.images[pageIndex]}
                    alt={`${chapter.label} — page ${pageIndex + 1}`}
                    className="comic-image"
                    style={imageLoaded ? undefined : { display: 'none' }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                  />
              </div>
              <div className="page-indicator-below">{pageIndex + 1} / {total}</div>
            </div>

            <button
              className={`nav next${pageIndex + 1 >= total ? " disabled" : ""}`}
              disabled={pageIndex + 1 >= total}
              aria-label="Next page"
              {...makeNavHandlers(pageIndex + 1 >= total, next, setNextState)}
            >
              <img
                src={navImg("Next", pageIndex + 1 >= total ? "normal" : nextState)}
                alt=""
                draggable={false}
                className="nav-img"
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
