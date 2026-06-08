// Global audio context — manages background music and sound effects.
// Persists volume and mute state to localStorage. Music starts deferred
// until the first user interaction to satisfy browser autoplay policy.
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
  // --- PERSISTED STATE ---
  // Volume (0–1) and muted flag are read from localStorage on mount.

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

  const [musicMuted, setMusicMuted] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("music-muted");
    return saved !== null ? JSON.parse(saved) : false;
  });

  // --- SAVE TO LOCALSTORAGE ---

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("music-muted", JSON.stringify(musicMuted));
    }
  }, [musicMuted]);

  // --- STATE ---

  const [musicPlaying, setMusicPlaying] = useState(false);

  const audioRef = useRef(null);
  const soundPoolRef = useRef({});
  const activeSoundsRef = useRef(new Set());
  const effectiveVolumeRef = useRef(0.5);
  const musicPlayingRef = useRef(false);
  const currentMusicSrcRef = useRef(null);
  const interactionStartRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  // Ref so playSound can check mute state without being recreated on every change.
  const mutedRef = useRef(muted);
  const musicMutedRef = useRef(musicMuted);

  const toggleMute = useCallback(() => setMuted((prev) => !prev), []);
  const toggleMusicMute = useCallback(() => setMusicMuted((prev) => !prev), []);

  const effectiveVolume = muted ? 0 : volume;

  // --- SOUND PRELOADING ---
  // Pre-instantiate Audio objects so playback is immediate (no decode delay).

  useEffect(() => {
    ["/sounds/logo/Snap.mp3", "/sounds/misc/Click.mp3"].forEach((src) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load();
      soundPoolRef.current[src] = audio;
    });
  }, []);

  // --- PLAY SOUND ---

  const playSound = useCallback((src, volume) => {
    // Bail out when muted — iOS ignores audio.volume=0 and plays at full level anyway.
    if (mutedRef.current) return;
    if (!soundPoolRef.current[src]) {
      const audio = new Audio(src);
      audio.preload = "auto";
      soundPoolRef.current[src] = audio;
    }
    const audio = soundPoolRef.current[src];
    const requestedVol = Math.max(0, Math.min(1, volume ?? effectiveVolumeRef.current));
    // Store ratio relative to master so live sync can scale correctly.
    audio._volumeRatio = effectiveVolumeRef.current > 0 ? requestedVol / effectiveVolumeRef.current : 1;
    audio.volume = requestedVol;
    audio.currentTime = 0;
    activeSoundsRef.current.add(audio);
    audio.onended = () => activeSoundsRef.current.delete(audio);
    audio.play().catch(() => { activeSoundsRef.current.delete(audio); });
  }, []);

  // --- SYNC REFS ---
  // Keep plain refs in sync with state so rAF loops and callbacks always
  // read the current value without being listed as effect dependencies.

  useEffect(() => {
    effectiveVolumeRef.current = effectiveVolume;
  }, [effectiveVolume]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    musicMutedRef.current = musicMuted;
  }, [musicMuted]);

  useEffect(() => {
    musicPlayingRef.current = musicPlaying;
  }, [musicPlaying]);

  // --- CLEANUP ---
  // Removes the one-time interaction listeners added by startMusic.

  const cleanupInteractionListeners = useCallback(() => {
    if (interactionStartRef.current) {
      window.removeEventListener("mousedown", interactionStartRef.current);
      window.removeEventListener("keydown", interactionStartRef.current);
      window.removeEventListener("touchstart", interactionStartRef.current);
      interactionStartRef.current = null;
    }
  }, []);

  // --- START MUSIC ---
  // Creates the audio element, then waits for the first user interaction
  // before playing (required by browser autoplay policy). Fades in from 0.

  const startMusic = useCallback(() => {
    if (audioRef.current || musicPlayingRef.current) return;

    const audio = new Audio("/music/home.mp3");
    audio.loop = true;
    audio.volume = 0;
    audio.muted = true;

    audioRef.current = audio;

    currentMusicSrcRef.current = "/music/home.mp3";
    let started = false;

    const fadeIn = () => {
      clearInterval(fadeIntervalRef.current);
      let currentVolume = 0;

      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) {
          clearInterval(fadeIntervalRef.current);
          return;
        }

        // Read target dynamically so the fade always aims at the current volume.
        // Respect music-only mute independently of the main mute flag.
        const target = musicMutedRef.current ? 0 : effectiveVolumeRef.current;
        currentVolume = Math.min(currentVolume + 0.001, target);
        audioRef.current.volume = currentVolume;

        if (currentVolume >= target) {
          clearInterval(fadeIntervalRef.current);
        }
      }, 10);
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
      // autoplay blocked — startAudio() will fire on first interaction
    });
  }, [cleanupInteractionListeners]);

  // --- STOP MUSIC ---

  const stopMusic = useCallback(() => {
    cleanupInteractionListeners();
    clearInterval(fadeIntervalRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    musicPlayingRef.current = false;
    setMusicPlaying(false);
    currentMusicSrcRef.current = null;
  }, [cleanupInteractionListeners]);

  // --- SWITCH MUSIC ---
  // Swaps to a new looping track immediately with fade-in.
  // No interaction guard — the caller is responsible for ensuring the user
  // has already interacted. Pass null/undefined to stop music entirely.
  // Skips the swap if the requested track is already playing.

  const switchMusic = useCallback((src) => {
    if (!src) {
      stopMusic();
      return;
    }

    // Already playing this track — nothing to do.
    if (src === currentMusicSrcRef.current && musicPlayingRef.current) return;

    cleanupInteractionListeners();
    clearInterval(fadeIntervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    musicPlayingRef.current = false;
    setMusicPlaying(false);
    currentMusicSrcRef.current = src;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const silenced = musicMutedRef.current || mutedRef.current;
    audio.muted = silenced;

    audio
      .play()
      .then(() => {
        musicPlayingRef.current = true;
        setMusicPlaying(true);
        // Fade in — mirrors startMusic's fadeIn logic.
        clearInterval(fadeIntervalRef.current);
        let vol = 0;
        fadeIntervalRef.current = setInterval(() => {
          if (!audioRef.current) { clearInterval(fadeIntervalRef.current); return; }
          const target = (musicMutedRef.current || mutedRef.current) ? 0 : effectiveVolumeRef.current;
          vol = Math.min(vol + 0.001, target);
          audioRef.current.volume = vol;
          if (vol >= target) clearInterval(fadeIntervalRef.current);
        }, 10);
      })
      .catch((err) => console.error("Failed to switch music:", err));
  }, [cleanupInteractionListeners, stopMusic]);

  // --- SYNC VOLUME TO AUDIO ---

  useEffect(() => {
    // Sync background music.
    if (audioRef.current) {
      // Cancel any active fade so the user's manual change takes immediate effect.
      clearInterval(fadeIntervalRef.current);
      // Use .muted for reliable cross-platform muting (iOS Safari ignores .volume changes)
      const silenced = muted || musicMuted;
      audioRef.current.muted = silenced;
      audioRef.current.volume = silenced ? 0 : volume;
    }
    // Sync in-flight sound effects.
    for (const audio of activeSoundsRef.current) {
      audio.muted = muted;
      audio.volume = muted ? 0 : Math.max(0, Math.min(1, volume * (audio._volumeRatio ?? 1)));
    }
  }, [muted, musicMuted, volume]);

  // --- CONTEXT VALUE ---

  return (
    <AudioContext.Provider
      value={{
        volume,
        setVolume,
        muted,
        toggleMute,
        musicMuted,
        toggleMusicMute,
        effectiveVolume,
        playSound,
        startMusic,
        stopMusic,
        switchMusic,
        musicPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

// --- HOOK ---
export function useAudio() {
  return useContext(AudioContext);
}