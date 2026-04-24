import { create } from 'zustand';
import { CHECKPOINTS } from '../data/checkpoints';

export const useScrollStore = create((set, get) => ({
  scrollProgress: 0,
  currentCheckpoint: CHECKPOINTS[0],
  localProgress: 0,
  narrativeProgress: 0, // 0 to 1 gradient sweep
  sceneProgress: 0,     // Damped/Stalled progress for the 3D engine
  isMuted: true,
  isLocked: false,      // External lock state
  
  setIsLocked: (locked) => set({ isLocked: locked }),

  setScrollProgress: (progress) => {
    // Find CP
    let foundCheckpoint = CHECKPOINTS.find(
      (cp) => progress >= cp.scrollStart && progress < cp.scrollEnd
    );

    if (!foundCheckpoint) {
      if (progress >= 1) foundCheckpoint = CHECKPOINTS[CHECKPOINTS.length - 1];
      else foundCheckpoint = CHECKPOINTS[0];
    }
    
    // Local 0-1
    const range = foundCheckpoint.scrollEnd - foundCheckpoint.scrollStart;
    let local = 0;
    if (range > 0) {
      local = Math.max(0, Math.min(1, (progress - foundCheckpoint.scrollStart) / range));
    }

    // NARRATIVE LOCK LOGIC (PINNING)
    let narrative = 0;
    
    // We want the 3D scene to move consistently, but maybe just slow down slightly near the text.
    // The previous lock logic was completely overwriting the `sceneProgress` 
    // causing the 3D path to get stuck jumping back and forth.
    // Let's use standard progress for the scene so the 3js exploration isn't ruined!
    let sceneProg = progress;

    if (foundCheckpoint.id !== 8) { 
      const lockStart = 0.15;
      const lockEnd = 0.85;
      
      // Calculate narrative reveal
      if (local < lockStart) {
        narrative = 0;
      } else if (local <= lockEnd) {
        narrative = (local - lockStart) / (lockEnd - lockStart);
        // Add a slight "friction" to the camera movement during reading but DON'T stop it
        sceneProg = progress - (range * 0.15 * Math.sin(narrative * Math.PI)); 
      } else {
        narrative = 1;
      }
    }

    set({
      scrollProgress: progress,
      sceneProgress: sceneProg,
      currentCheckpoint: foundCheckpoint,
      localProgress: local,
      narrativeProgress: narrative
    });
  },
  
  setIsMuted: (muted) => set({ isMuted: muted })
}));
