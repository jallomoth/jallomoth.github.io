import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const audioRef = useRef(null);
  const effectiveVolumeRef = useRef(0.5);
  const musicPlayingRef = useRef(false);
  const interactionStartRef = useRef(null);

  const toggleMute = useCallback(() => setMuted((prev) => !prev), []);

  const effectiveVolume = muted ? 0 : volume;

  useEffect(() => {
    effectiveVolumeRef.current = effectiveVolume;
  }, [effectiveVolume]);

  useEffect(() => {
    musicPlayingRef.current = musicPlaying;
  }, [musicPlaying]);

  const cleanupInteractionListeners = useCallback(() => {
    if (interactionStartRef.current) {
      window.removeEventListener("mousedown", interactionStartRef.current);
      window.removeEventListener("keydown", interactionStartRef.current);
      window.removeEventListener("touchstart", interactionStartRef.current);
      interactionStartRef.current = null;
    }
  }, []);

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

        currentVolume = Math.min(currentVolume + 0.001, target);
        audioRef.current.volume = currentVolume;

        if (currentVolume >= target) {
          clearInterval(fade);
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
          console.error('Failed to play audio:', err);
        });
    };

    interactionStartRef.current = startAudio;

    window.addEventListener("mousedown", startAudio, { once: true });
    window.addEventListener("keydown", startAudio, { once: true });
    window.addEventListener("touchstart", startAudio, { once: true });

    audio.addEventListener('error', (e) => {
      console.error('Audio load error:', e);
      cleanupInteractionListeners();
    }, { once: true });

    audio.play().catch(() => {
      // autoplay blocked; wait for user interaction
    });

    audio.load();
  }, [cleanupInteractionListeners]);

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

  // sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  return (
    <AudioContext.Provider
      value={{
        volume,
        setVolume,
        muted,
        toggleMute,
        effectiveVolume,
        startMusic,
        stopMusic,
        musicPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}