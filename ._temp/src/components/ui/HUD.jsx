import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScroll } from '../../context/ScrollContext';
import { CHECKPOINTS } from '../../data/checkpoints';
import { ChapterCard } from './ChapterCard';
import './HUD.css';

export function HUD() {
  const { scrollProgress, currentCheckpoint, localProgress, isMuted, setIsMuted } = useScroll();

  const getNeedleAngle = () => {
    const nextIndex = Math.min(currentCheckpoint.id + 1, CHECKPOINTS.length - 1);
    const nextCheckpoint = CHECKPOINTS[nextIndex];
    if (!nextCheckpoint || currentCheckpoint.id === nextCheckpoint.id) return currentCheckpoint.needleAngle;
    return currentCheckpoint.needleAngle + (nextCheckpoint.needleAngle - currentCheckpoint.needleAngle) * localProgress;
  };
  
  const angle = getNeedleAngle();

  return (
    <div className="hud-container">
      {/* Mute Button */}
      <button 
        className="hud-mute-btn" 
        onClick={() => setIsMuted(!isMuted)}
        style={{ pointerEvents: 'auto' }} // specifically override to allow clicking the HUD overlay
      >
        {isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}
      </button>

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
