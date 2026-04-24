import React from 'react';
import { useScrollStore } from '../../store/useScrollStore';
import { motion } from 'framer-motion';

export function ProgressBar() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        width: '4px',
        height: '40vh',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        zIndex: 50,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          transformOrigin: 'top',
          scaleY: scrollProgress
        }}
      />
    </div>
  );
}
