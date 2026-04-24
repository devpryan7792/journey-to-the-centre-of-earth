import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useScrollStore } from '../../store/useScrollStore';

// Project: Journey to the Centre of the Earth — Scroll 3D Experience
// Component: VelvetFade.jsx
// Purpose: DOM-level warm overlay fades for the Library handoff AND the final page-turn ending

export function VelvetFade() {
  const fadeRef = useRef();
  const textRef = useRef(); // Added for the THE END cinematic text

  useEffect(() => {
    return useScrollStore.subscribe(
      (state) => state.scrollProgress,
      (p) => {
        let targetOpacity = 0.0;
        let targetColor = '#1a0f0a'; // Default espresso
        let targetTextOpacity = 0.0;
        let targetTextScale = 0.95;

        // Opening: Library → Tunnel handoff (0.08 → 0.12)
        if (p >= 0.08 && p <= 0.10) {
          targetOpacity = (p - 0.08) / 0.02;
        } else if (p > 0.10 && p <= 0.12) {
          targetOpacity = 1.0 - ((p - 0.10) / 0.02);
        }

        // Ending: Page Turn — the book is closing (0.94 → 1.0)
        if (p >= 0.94) {
          targetColor = '#150a04'; // Deep cinematic dark brown / sepia
          targetOpacity = Math.min(1.0, (p - 0.94) / 0.05); // Fully opaque by 0.99
          
          // Trigger "THE END" pop-out text right as the screen hits full darkness at 0.98
          if (p >= 0.98) {
            targetTextOpacity = Math.min(1.0, (p - 0.98) / 0.02);
            targetTextScale = 1.0 + ((p - 0.98) * 1.5); // Cinematic push-in effect
          }
        }

        gsap.to(fadeRef.current, { 
          opacity: targetOpacity, 
          backgroundColor: targetColor,
          duration: 0.15, 
          ease: 'none' 
        });

        // Independent animation timeline for the text inside
        gsap.to(textRef.current, {
          opacity: targetTextOpacity,
          scale: targetTextScale,
          duration: 0.15,
          ease: 'none'
        });
      }
    );
  }, []);

  return (
    <div 
      ref={fadeRef}
      style={{
        position: 'absolute',
        top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: '#1a0f0a',
        pointerEvents: 'none',
        opacity: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Cinematic Title that rises out of the darkness */}
      <h1
        ref={textRef}
        style={{
          color: '#c9a84c',
          fontFamily: 'serif',
          fontSize: '2vw',
          letterSpacing: '1.2em',
          textTransform: 'uppercase',
          marginRight: '-1.2em', // Balancing margin for extreme letter-spacing centering
          textShadow: '0 0 30px rgba(201, 168, 76, 0.4)',
          opacity: 0,
          transform: 'scale(0.95)'
        }}
      >
        The End
      </h1>
    </div>
  );
}
