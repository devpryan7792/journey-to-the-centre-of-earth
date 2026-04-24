import { useEffect, useRef } from 'react';
import { useScrollStore } from '../store/useScrollStore';

export function useSoundscape() {
  const isMuted = useScrollStore((state) => state.isMuted);
  const tracks = useRef({});

  // 1. Initialize Audio Objects
  useEffect(() => {
    tracks.current = {
      library: new Audio('/audio/library_ambience.mp3'),
      cave: new Audio('/audio/cave_wind.mp3'),
      magma: new Audio('/audio/magma_rumble.mp3')
    };

    Object.values(tracks.current).forEach(audio => {
      audio.loop = true;
      audio.volume = 0; // Everything starts silent
    });

    return () => {
      Object.values(tracks.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  // 2. Play/Pause based on Mute state
  useEffect(() => {
    Object.values(tracks.current).forEach(audio => {
      audio.muted = isMuted;
      if (!isMuted && audio.paused) {
        // We catch DOMExceptions in case autoplay policy blocks playback
        audio.play().catch(e => console.log('Audio autoplay blocked by browser', e));
      }
    });
  }, [isMuted]);

  // 3. The Crossfade Audio Engine Logic
  useEffect(() => {
    return useScrollStore.subscribe(
      (state) => state.scrollProgress,
      (p) => {
        if (!tracks.current.library) return;
        
        let libVol = 0;
        let caveVol = 0;
        let magmaVol = 0;

        // Library: 100% until 0.15, fades out at 0.25
        if (p <= 0.15) libVol = 1.0;
        else if (p > 0.15 && p <= 0.25) libVol = 1.0 - (p - 0.15) / 0.1;

        // Cave Wind: 100% from 0.2 to 0.8
        if (p > 0.15 && p <= 0.25) caveVol = (p - 0.15) / 0.1; // Fade in
        else if (p > 0.25 && p <= 0.75) caveVol = 1.0;          // Sustained
        else if (p > 0.75 && p <= 0.85) caveVol = 1.0 - (p - 0.75) / 0.1; // Fade out

        // Magma Rumble: 100% from 0.8 to 1.0
        if (p > 0.75 && p <= 0.85) magmaVol = (p - 0.75) / 0.1;
        else if (p > 0.85) magmaVol = 1.0;

        // Apply bounded clamps
        tracks.current.library.volume = Math.max(0, Math.min(1, libVol));
        tracks.current.cave.volume = Math.max(0, Math.min(1, caveVol));
        tracks.current.magma.volume = Math.max(0, Math.min(1, magmaVol));
      }
    );
  }, []);
}
