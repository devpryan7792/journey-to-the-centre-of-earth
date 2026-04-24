import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollStore } from '../../store/useScrollStore';

// Extracted from HUD.jsx precisely to modularize the Story Bible's 'Gold Standard' Chapter Cards
export function ChapterCard() {
  const currentCheckpoint = useScrollStore((state) => state.currentCheckpoint);

  return (
    <AnimatePresence mode="wait">
      {currentCheckpoint.card && (
        <motion.div 
          key={"card-" + currentCheckpoint.id}
          className="chapter-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'rgba(18, 10, 5, 0.1)', // Severely lower opacity
            backdropFilter: 'blur(2px)'         // Lower blur to not block the scene
          }}
        >
          {/* Absolute-positioned Gold Standard L-shaped corner ornaments as specified */}
          <div className="card-ornament top-left" style={{ opacity: 0.3 }} />
          <div className="card-ornament top-right" style={{ opacity: 0.3 }} />
          <div className="card-ornament bottom-left" style={{ opacity: 0.3 }} />
          <div className="card-ornament bottom-right" style={{ opacity: 0.3 }} />
          
          {/* Thin horizontal gold gradient top edge */}
          <div className="card-top-line" style={{ opacity: 0.3 }} />
          
          {/* Framer slide-up cascade */}
          <motion.div
            key={"text-" + currentCheckpoint.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {/* Label naturally receives 0.4em uppercase Cinzel based on global UI rules in HUD.css */}
            <div className="card-label" style={{ opacity: 0.5 }}>{currentCheckpoint.card.label}</div>
            
            <h2 className="card-title" style={{ opacity: 0.8 }}>{currentCheckpoint.card.title}</h2>
            
            {/* Body completely removed to prevent blocking UI */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
