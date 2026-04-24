import React from 'react';
import { ScrollProvider } from './context/ScrollContext';
import { MainCanvas } from './components/scene/MainCanvas';
import { HUD } from './components/ui/HUD';
import { useSoundscape } from './hooks/useSoundscape';
import { VelvetFade } from './components/ui/VelvetFade';
import { CustomCursor } from './components/ui/CustomCursor';
import './App.css'; 

function SoundscapeRunner() {
  useSoundscape();
  return null;
}

function App() {
  return (
    <ScrollProvider>
      <div className="app-container">
        <SoundscapeRunner />
        {/* The fixed 3D Canvas sits behind the rest of the application */}
        <MainCanvas />
        <VelvetFade />

        {/* 
          This defines the total scrollable space (900vh total height).
          It forces the browser to allow scrolling so useScrollProgress works.
          The user explicitly mentioned "800vh" for the "8 pages", plus 100vh for the viewport itself gives 900vh total, which matches the story bible.
        */}
        <div style={{ position: 'relative', height: '900vh', width: '100%', pointerEvents: 'none' }}>
          {/* Persistent UI overlays will be injected here (Progress bar, context UI, cards, etc) */}
        </div>
        <HUD />
        <CustomCursor />
      </div>
    </ScrollProvider>
  );
}

export default App;
