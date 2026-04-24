import { useState, useEffect } from 'react';
import Lenis from 'lenis';

// PROJECT: Journey to the Centre of the Earth
// FILE: useScrollProgress.js
// UPDATE: Switched to Lenis for normalized, buttery smooth virtual scroll

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Initialize Lenis with optimal settings for a cinematic scroll
    const lenis = new Lenis({
      duration: 1.2, // Slightly faster for responsiveness
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Quintic-ish
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.0, // Standard speed for better control
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    let animationFrameId;

    // Synchronize scroll on resize to prevent limit errors
    const handleResize = () => {
      lenis.resize();
    };
    window.addEventListener('resize', handleResize);

    // The scroll event is now fired cleanly by Lenis
    lenis.on('scroll', ({ scroll, limit, progress }) => {
      // Use progress directly if available, otherwise calculate
      const p = (typeof progress === 'number') ? progress : (limit > 0 ? scroll / limit : 0);
      setScrollProgress(Math.max(0, Math.min(1, p)));
    });

    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    
    animationFrameId = requestAnimationFrame(raf);

    // Initial check in case of mid-page reload
    if (document.documentElement.scrollHeight > window.innerHeight) {
       const initialScroll = window.scrollY || 0;
       const limit = document.documentElement.scrollHeight - window.innerHeight;
       setScrollProgress(Math.max(0, Math.min(1, initialScroll / limit)));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      lenis.destroy();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return scrollProgress;
}
