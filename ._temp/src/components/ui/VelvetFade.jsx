import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useScroll } from '../../context/ScrollContext';

// Project: Journey to the Centre of the Earth — Scroll 3D Experience
// Component: VelvetFade.jsx
// Purpose: DOM-level warm overlay fades for the Library handoff AND the final page-turn ending

export function VelvetFade() {
  const { scrollProgress } = useScroll();
  const fadeRef = useRef();

  useEffect(() => {
    const p = scrollProgress;
    let targetOpacity = 0.0;
    let targetColor = '#1a0f0a'; // Default espresso

    // Opening: Library → Tunnel handoff (0.08 → 0.12)
    if (p >= 0.08 && p <= 0.10) {
      targetOpacity = (p - 0.08) / 0.02;
    } else if (p > 0.10 && p <= 0.12) {
      targetOpacity = 1.0 - ((p - 0.10) / 0.02);
    }

    // Ending: Page Turn — the book is closing (0.94 → 1.0)
    if (p >= 0.94) {
      targetColor = '#f2e6c9'; // Warm parchment cream, like a page covering the scene
      targetOpacity = Math.min(1.0, (p - 0.94) / 0.05); // Fully opaque by 0.99
    }

    gsap.to(fadeRef.current, { 
      opacity: targetOpacity, 
      backgroundColor: targetColor,
      duration: 0.15, 
      ease: 'none' 
    });
  }, [scrollProgress]);

  return (
    <div 
      ref={fadeRef}
      style={{
        position: 'absolute',
        top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: '#1a0f0a',
        pointerEvents: 'none',
        opacity: 0,
        zIndex: 50
      }}
    />
  );
}
