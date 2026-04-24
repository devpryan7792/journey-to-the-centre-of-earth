import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollStore } from '../../store/useScrollStore';
import { CHECKPOINTS } from '../../data/checkpoints';
import { ChapterCard } from './ChapterCard';
import './HUD.css';

// Hyper-tactile Magnetic Button Wrapper
function MagneticButton({ children, onClick, className, isMuted }) {
  const ref = useRef(null);
  const hitAreaRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = hitAreaRef.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // Calculate distance from center to create a dynamic pull
    setPosition({ x: middleX * 0.6, y: middleY * 0.6 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <div 
      ref={hitAreaRef}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ padding: '30px', margin: '-30px', cursor: 'pointer' }}
    >
      <motion.button
        ref={ref}
        className={className}
        onClick={onClick}
        animate={{ x, y }}
        transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.2 }}
        style={{ pointerEvents: 'auto' }}
      >
        {children}
      </motion.button>
    </div>
  );
}

export function HUD() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const currentCheckpoint = useScrollStore((state) => state.currentCheckpoint);
  const localProgress = useScrollStore((state) => state.localProgress);
  const isMuted = useScrollStore((state) => state.isMuted);
  const setIsMuted = useScrollStore((state) => state.setIsMuted);

  const getNeedleAngle = () => {
    const nextIndex = Math.min(currentCheckpoint.id + 1, CHECKPOINTS.length - 1);
    const nextCheckpoint = CHECKPOINTS[nextIndex];
    if (!nextCheckpoint || currentCheckpoint.id === nextCheckpoint.id) return currentCheckpoint.needleAngle;
    return currentCheckpoint.needleAngle + (nextCheckpoint.needleAngle - currentCheckpoint.needleAngle) * localProgress;
  };
  
  const angle = getNeedleAngle();

  return (
    <div className="hud-container">
      {/* Mute Button with Magnetic Effect */}
      <div className="hud-audio-controls">
        <MagneticButton 
          className={`hud-mute-btn ${isMuted ? 'is-muted' : ''}`} 
          onClick={() => setIsMuted(!isMuted)}
          isMuted={isMuted}
        >
          <div className="audio-icon">
            <div className={`bar ${isMuted ? 'muted' : 'playing'}`}></div>
            <div className={`bar ${isMuted ? 'muted' : 'playing'}`}></div>
            <div className={`bar ${isMuted ? 'muted' : 'playing'}`}></div>
          </div>
          <span>{isMuted ? 'UNMUTE CAVE VOICE' : 'NARRATION ACTIVE'}</span>
        </MagneticButton>
        {isMuted && (
          <div className="audio-cta">Tap to hear the mountain's secrets</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ width: `${scrollProgress * 100}%` }} />

      {/* Env Label */}
      {scrollProgress >= 0.04 && scrollProgress <= 0.94 && (
        <div className="env-label">{currentCheckpoint.envLabel}</div>
      )}

      {/* Compass */}
      <div className="compass-container">
        <div className="compass">
          <span className="compass-label n">N</span>
          <span className="compass-label e">E</span>
          <span className="compass-label s">S</span>
          <span className="compass-label w">W</span>
          <motion.div 
            className="compass-needle" 
            animate={{ rotate: angle }} 
            transition={{ type: "tween", duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }} 
          >
             <div className="needle-north"></div>
             <div className="needle-south"></div>
             <div className="needle-center"></div>
          </motion.div>
        </div>
        <div className="compass-depth">{currentCheckpoint.depth}</div>
      </div>

      {/* Depth Meter */}
      <div className="depth-meter-container">
        <div className="depth-meter-line">
          <div className="depth-meter-dot" style={{ top: `${currentCheckpoint.depthPercent}%` }} />
          <div className="depth-meter-ticks">
            <span style={{ top: '0%' }}>Surface</span>
            <span style={{ top: '25%' }}>−15 km</span>
            <span style={{ top: '50%' }}>−60 km</span>
            <span style={{ top: '75%' }}>−120 km</span>
            <span style={{ top: '100%' }}>Centre</span>
          </div>
        </div>
      </div>

      {/* Chapter Card Modularized to Gold Standard */}
      <ChapterCard />
    </div>
  );
}
