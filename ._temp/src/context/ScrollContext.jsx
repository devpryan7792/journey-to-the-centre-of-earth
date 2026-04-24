import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { CHECKPOINTS } from '../data/checkpoints';

const ScrollContext = createContext(null);

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};

export const ScrollProvider = ({ children }) => {
  const scrollProgress = useScrollProgress();
  const [currentCheckpoint, setCurrentCheckpoint] = useState(CHECKPOINTS[0]);
  const [localProgress, setLocalProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Browsers restrict autoplay, start muted

  useEffect(() => {
    // Find the checkpoint whose scroll range contains the current progress
    let foundCheckpoint = CHECKPOINTS.find(
      (cp) => scrollProgress >= cp.scrollStart && scrollProgress < cp.scrollEnd
    );

    // Handle the exact 1.0 boundary case
    if (!foundCheckpoint) {
      if (scrollProgress >= 1) {
        foundCheckpoint = CHECKPOINTS[CHECKPOINTS.length - 1]; // Credits
      } else {
        foundCheckpoint = CHECKPOINTS[0]; // Fallback to start
      }
    }
    
    if (foundCheckpoint.id !== currentCheckpoint.id) {
      setCurrentCheckpoint(foundCheckpoint);
      
      // Sound-Triggering Logic Placeholder
      console.log(`[Sound System] Scene Transition to: ${foundCheckpoint.envKey}`);
      if (foundCheckpoint.envKey === 'iceland') {
        console.log('[Sound Play] Wind howling...');
      } else if (foundCheckpoint.envKey === 'tunnels') {
        console.log('[Sound Play] Water dripping...');
      }
    }

    // Calculate progress normalized from 0 to 1 within the current checkpoint
    const range = foundCheckpoint.scrollEnd - foundCheckpoint.scrollStart;
    let local = 0;
    if (range > 0) {
      local = (scrollProgress - foundCheckpoint.scrollStart) / range;
      local = Math.max(0, Math.min(1, local));
    }
    setLocalProgress(local);

  }, [scrollProgress, currentCheckpoint.id]);

  const value = useMemo(() => ({
    scrollProgress,
    currentCheckpoint,
    localProgress,
    isMuted,
    setIsMuted
  }), [scrollProgress, currentCheckpoint, localProgress, isMuted, setIsMuted]);

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
};
