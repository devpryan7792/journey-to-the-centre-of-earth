import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScroll } from '../../context/ScrollContext';

// Extracted from HUD.jsx precisely to modularize the Story Bible's 'Gold Standard' Chapter Cards
export function ChapterCard() {
  const { currentCheckpoint } = useScroll();

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
        >
          {/* Absolute-positioned Gold Standard L-shaped corner ornaments as specified */}
          <div className="card-ornament top-left" />
          <div className="card-ornament top-right" />
          <div className="card-ornament bottom-left" />
          <div className="card-ornament bottom-right" />
          
          {/* Thin horizontal gold gradient top edge */}
          <div className="card-top-line" />
          
          {/* Framer slide-up cascade */}
          <motion.div
            key={"text-" + currentCheckpoint.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {/* Label naturally receives 0.4em uppercase Cinzel based on global UI rules in HUD.css */}
            <div className="card-label">{currentCheckpoint.card.label}</div>
            
            <h2 className="card-title">{currentCheckpoint.card.title}</h2>
            
            {/* Body natively receives italic 1.85 line-height EB Garamond */}
            <p className="card-body" dangerouslySetInnerHTML={{ __html: currentCheckpoint.card.body.replace(/\n/g, '<br/>') }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
