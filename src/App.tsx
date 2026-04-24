import React from 'react';
import { ScrollProvider } from './context/ScrollContext';
import { MainCanvas } from './components/scene/MainCanvas';
import { HUD } from './components/ui/HUD';
import { useSoundscape } from './hooks/useSoundscape';
import { useNarration } from './hooks/useNarration';
import { VelvetFade } from './components/ui/VelvetFade';
import { CustomCursor } from './components/ui/CustomCursor';
import { CheckpointOverlay } from './components/checkpoints/CheckpointOverlay';
import { ProgressBar } from './components/ui/ProgressBar';
import './App.css';

function SoundscapeRunner() {
  useSoundscape();
  return null;
}

function AppContent() {
  useNarration();
  return (
    <>
      <SoundscapeRunner />
      
      {/* 1. The 3D Canvas sits at the absolute bottom layer */}
      <MainCanvas />
      
      {/* 2. The DOM Layer sits on top. Transparent, pointer-events-none by default except where needed */}
      <div className="app-container relative bg-transparent min-h-screen text-white overflow-x-hidden selection:bg-white/30 z-10 w-full pointer-events-none">
        
        <VelvetFade />

        {/* 
          This defines the total scrollable space (900vh total height).
          It forces the browser to allow scrolling so useScrollProgress works.
          pointerEvents: 'auto' so it actually grabs the wheel/touch.
        */}
        <div style={{ position: 'relative', height: '900vh', width: '100%', pointerEvents: 'auto' }}>
        </div>
        
        <div className="fixed inset-0 pointer-events-none z-50">
          <ProgressBar />
          
          {/* We need HUD interactive but overlay mostly pass-through */}
          <div className="pointer-events-auto">
            <HUD />
          </div>
          
          <CheckpointOverlay />
          <CustomCursor />
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ScrollProvider>
      <AppContent />
    </ScrollProvider>
  );
}

export default App;
