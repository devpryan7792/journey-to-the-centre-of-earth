import { useEffect } from 'react';

export function useShery(isActive) {
  useEffect(() => {
    if (!isActive || typeof window.Shery === 'undefined') return;

    // We use a small timeout to ensure React has fully committed the DOM 
    // and the high-res local image is ready for WebGL injection
    const timer = setTimeout(() => {
      try {
        window.Shery.imageEffect(".checkpoint-illustration", {
          style: 5,
          config: {
            uFrequencyX: { value: 12, range: [0, 100] },
            uFrequencyY: { value: 8, range: [0, 100] },
            uAmplitude:  { value: 40, range: [0, 200] },
            uSpeed:      { value: 0.6, range: [0.1, 1] },
            uResolution: { value: 2 },
          },
          gooey: false,
        });
      } catch (e) {
        console.warn("Shery.js failed to initialize:", e);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const canvases = document.querySelectorAll('.checkpoint-illustration-wrap canvas');
      canvases.forEach(c => c.remove());
    };
  }, [isActive]);
}
