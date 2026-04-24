import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Global CSS injection to enforce `cursor: none` broadly without relying on specific CSS sheets
// Only applies on devices that support hover
const globalCursorHidingStyles = `
  @media (hover: hover) and (pointer: fine) {
    body, body * {
      cursor: none !important;
    }
  }
`;

export function CustomCursor() {
  const [isClicking, setIsClicking] = useState(false);
  const [hasHover, setHasHover] = useState(true);

  useEffect(() => {
    // Detect if device supports hover
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      setHasHover(false);
    }
  }, []);

  // Core Mouse Position Array
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Outer Ring Spring (Creates the drag/liquid effect)
  const springConfig = { damping: 20, stiffness: 200, mass: 0.8 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (!hasHover) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY, hasHover]);

  if (!hasHover) {
    return null; // Skip rendering on touch devices
  }

  return (
    <>
      <style>{globalCursorHidingStyles}</style>
      <div style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}>
        
        {/* The Outer Trailing Ring */}
        <motion.div
          animate={{ scale: isClicking ? 0.8 : 1 }}
          style={{
            position: 'absolute',
            width: '38px',
            height: '38px',
            x: cursorXSpring, 
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
            border: '1px solid rgba(201, 168, 76, 0.45)', // Custom Gold border
            borderRadius: '50%',
          }}
        />

        {/* The Inner Rigid Gold Dot */}
        <motion.div
          animate={{ scale: isClicking ? 1.4 : 1 }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            x: cursorX, 
            y: cursorY,
            translateX: '-50%',
            translateY: '-50%',
            backgroundColor: '#c9a84c',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(201, 168, 76, 0.8)',
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </>
  );
}
