import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

const AudioContext = createContext();

export function AudioProvider({ children }) {
  /* -----------------------------
     PERSISTED STATE (SAFE)
  ----------------------------- */

  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 0.5;

    const saved = parseFloat(localStorage.getItem("volume"));
    if (isNaN(saved)) return 0.5;

    return Math.max(0, Math.min(1, saved));
  });

  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("muted");
    return saved !== null ? JSON.parse(saved) : false;
  });

  /* -----------------------------
     SAVE TO LOCALSTORAGE
  ----------------------------- */

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("volume", volume);
    }
  }, [volume]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("muted", JSON.stringify(muted));
    }
  }, [muted]);

  /* -----------------------------
     OTHER STATE
  ----------------------------- */

  const [musicPlaying, setMusicPlaying] = useState(false);

  const audioRef = useRef(null);
  const soundPoolRef = useRef({});
  const effectiveVolumeRef = useRef(0.5);
  const musicPlayingRef = useRef(false);
  const interactionStartRef = useRef(null);

  const toggleMute = useCallback(() => setMuted((prev) => !prev), []);

  const effectiveVolume = muted ? 0 : volume;

  /* -----------------------------
     PRELOAD SOUND EFFECTS INTO POOL
  ----------------------------- */

  useEffect(() => {
    ["/sounds/snap.mp3", "/sounds/click.mp3"].forEach((src) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load();
      soundPoolRef.current[src] = audio;
    });
  }, []);

  /* -----------------------------
     PLAY SOUND (SHARED HELPER)
  ----------------------------- */

  const playSound = useCallback((src, volume) => {
    if (!soundPoolRef.current[src]) {
      const audio = new Audio(src);
      audio.preload = "auto";
      soundPoolRef.current[src] = audio;
    }
    const audio = soundPoolRef.current[src];
    audio.volume = Math.max(0, Math.min(1, volume ?? effectiveVolumeRef.current));
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  /* -----------------------------
     SYNC REFS
  ----------------------------- */

  useEffect(() => {
    effectiveVolumeRef.current = effectiveVolume;
  }, [effectiveVolume]);

  useEffect(() => {
    musicPlayingRef.current = musicPlaying;
  }, [musicPlaying]);

  /* -----------------------------
     CLEANUP LISTENERS
  ----------------------------- */

  const cleanupInteractionListeners = useCallback(() => {
    if (interactionStartRef.current) {
      window.removeEventListener("mousedown", interactionStartRef.current);
      window.removeEventListener("keydown", interactionStartRef.current);
      window.removeEventListener("touchstart", interactionStartRef.current);
      interactionStartRef.current = null;
    }
  }, []);

  /* -----------------------------
     START MUSIC
  ----------------------------- */

  const startMusic = useCallback(() => {
    if (audioRef.current || musicPlayingRef.current) return;

    const audio = new Audio("/music/home.mp3");
    audio.loop = true;
    audio.volume = 0;
    audio.muted = true;

    audioRef.current = audio;

    let started = false;

    const fadeIn = () => {
      let currentVolume = 0;
      const target = effectiveVolumeRef.current;

      const fade = setInterval(() => {
        if (!audioRef.current) {
          clearInterval(fade);
          return;
        }

        currentVolume = Math.min(currentVolume + 1, target);
        audioRef.current.volume = currentVolume;

        if (currentVolume >= target) {
          clearInterval(fade);
        }
      }, 0);
    };

    const startAudio = () => {
      if (started) return;
      started = true;

      cleanupInteractionListeners();

      if (!audioRef.current || musicPlayingRef.current) return;

      audio.muted = false;

      audio
        .play()
        .then(() => {
          musicPlayingRef.current = true;
          setMusicPlaying(true);
          fadeIn();
        })
        .catch((err) => {
          console.error("Failed to play audio:", err);
        });
    };

    interactionStartRef.current = startAudio;

    window.addEventListener("mousedown", startAudio, { once: true });
    window.addEventListener("keydown", startAudio, { once: true });
    window.addEventListener("touchstart", startAudio, { once: true });

    audio.addEventListener(
      "error",
      (e) => {
        console.error("Audio load error:", e);
        cleanupInteractionListeners();
      },
      { once: true }
    );

    audio.play().catch(() => {
      // autoplay blocked
    });

    audio.load();
  }, [cleanupInteractionListeners]);

  /* -----------------------------
     STOP MUSIC
  ----------------------------- */

  const stopMusic = useCallback(() => {
    cleanupInteractionListeners();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    musicPlayingRef.current = false;
    setMusicPlaying(false);
  }, [cleanupInteractionListeners]);

  /* -----------------------------
     SYNC VOLUME TO AUDIO
  ----------------------------- */

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  /* -----------------------------
     CONTEXT
  ----------------------------- */

  return (
    <AudioContext.Provider
      value={{
        volume,
        setVolume,
        muted,
        toggleMute,
        effectiveVolume,
        playSound,
        startMusic,
        stopMusic,
        musicPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

/* -----------------------------
   HOOK
----------------------------- */

export function useAudio() {
  return useContext(AudioContext);
}