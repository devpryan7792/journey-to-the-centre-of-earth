import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, SSAO, BrightnessContrast, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { Experience } from './Experience';
import { Particles } from './Particles';
import { Atmosphere } from './Atmosphere';
import { useScroll } from '../../context/ScrollContext';

// PROJECT: Journey to the Centre of the Earth — Scroll 3D Experience
// FILE: MainCanvas.jsx

function EffectsPipeline({ degraded }) {
  const { scrollProgress } = useScroll();
  const p = scrollProgress;
  
  // Claustrophobia check: stronger effects in the dark tunnel (0.24 - 0.74)
  const isDark = p > 0.24 && p < 0.74;
  const vignetteDarkness = isDark ? 0.9 : 0.7;
  const noiseOpacity = isDark ? 0.5 : 0.3;

  // The 'Deep Blur' Hand-off (0.06 - 0.14) — gentle cinematic ramp
  let bokehScale = 0;
  if (p > 0.06 && p < 0.14) {
      const dist = Math.abs(p - 0.10); 
      bokehScale = (1.0 - (dist / 0.04)) * 10.0;
  }

  // Exact Post-Processing Map (Story Bible Section 9)
  
  // 1. Dynamic Bloom — disabled entirely when degraded for FPS recovery
  let bloomIntensity = degraded ? 0.0 : 1.0;
  if (!degraded) {
    if (p > 0.38 && p <= 0.50) bloomIntensity = 1.2;
    else if (p > 0.50 && p <= 0.62) bloomIntensity = 1.0;
    else if (p > 0.62 && p <= 0.74) bloomIntensity = 1.4;
    else if (p > 0.74 && p <= 0.86) bloomIntensity = 2.0;
    else if (p > 0.86 && p <= 0.95) bloomIntensity = 0.6;
    
    if (p > 0.93) bloomIntensity = 0.6 + ((p - 0.93) / 0.07) * 1.4;
  }

  // 2. Chromatic Aberration Shock Simulation
  let chromaOffset = 0.0;
  if (p > 0.62 && p <= 0.74) chromaOffset = 0.001;
  else if (p > 0.74 && p <= 0.86) chromaOffset = 0.004;
  if (p > 0.85 && p <= 0.93) chromaOffset = Math.max(chromaOffset, 0.002);

  // 3. Brightness ("The Deep Tint")
  let brightness = 0.0;
  if (p > 0.50 && p <= 0.62) brightness = -0.1;
  
  return (
    <EffectComposer>
      {/* SSAO disabled when degraded — heaviest single pass */}
      {!degraded && <SSAO samples={16} radius={4} intensity={20} luminanceInfluence={0.5} />}
      <DepthOfField focusDistance={0.0} focalLength={0.02} bokehScale={bokehScale} />
      <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={bloomIntensity} />
      <Noise opacity={noiseOpacity} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.3} darkness={vignetteDarkness} blendFunction={BlendFunction.NORMAL} />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[chromaOffset, chromaOffset]} />
      <BrightnessContrast brightness={brightness} contrast={0} />
    </EffectComposer>
  );
}

export function MainCanvas() {
  const [dpr, setDpr] = useState(1.5);
  const [degraded, setDegraded] = useState(false);

  const handleIncline = useCallback(() => {
    setDpr(1.5);
    setDegraded(false);
  }, []);

  const handleDecline = useCallback(() => {
    setDpr(0.8);
    setDegraded(true);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
      camera={{ position: [0, 3.5, 11], fov: 45 }}
    >
      <color attach="background" args={['#1a0f0a']} />
      
      <ambientLight intensity={0.2} />

      {/* Adaptive Performance: drops DPR to 0.8 and disables heavy effects when FPS < 55 */}
      <PerformanceMonitor
        onIncline={handleIncline}
        onDecline={handleDecline}
        flipflops={3}
        onFallback={() => setDegraded(true)}
      />
      
      {/* Light components — always mounted immediately */}
      <Atmosphere />
      <Particles />

      {/* Heavy components — wrapped in Suspense for smooth loading transitions */}
      <Suspense fallback={null}>
        <Experience />
        <EffectsPipeline degraded={degraded} />
      </Suspense>
    </Canvas>
  );
}

