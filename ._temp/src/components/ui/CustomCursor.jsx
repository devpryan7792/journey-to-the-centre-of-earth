import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Global CSS injection to enforce `cursor: none` broadly without relying on specific CSS sheets
const globalCursorHidingStyles = `
  body, body * {
    cursor: none !important;
  }
`;

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
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
  }, []);

  return (
    <>
      <style>{globalCursorHidingStyles}</style>
      <div style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}>
        
        {/* The Outer Trailing Ring */}
        <motion.div
          animate={{ 
            x: mousePosition.x - 19, 
            y: mousePosition.y - 19,
            scale: isClicking ? 0.8 : 1
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.6 }}
          style={{
            position: 'absolute',
            width: '38px',
            height: '38px',
            border: '1px solid rgba(201, 168, 76, 0.45)', // Custom Gold border
            borderRadius: '50%',
          }}
        />

        {/* The Inner Rigid Gold Dot */}
        <motion.div
          animate={{ 
            x: mousePosition.x - 5, 
            y: mousePosition.y - 5,
            scale: isClicking ? 1.4 : 1 // Expanding reaction on click dictated by Story Bible
          }}
          transition={{ type: 'tween', duration: 0 }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
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
