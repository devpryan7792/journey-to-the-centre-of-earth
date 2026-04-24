import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '../../store/useScrollStore';

export function Atmosphere() {
  const { scene } = useThree();

  useEffect(() => {
    // Initialize FogExp2 if not present
    if (!scene.fog || !scene.fog.isFogExp2) {
      scene.fog = new THREE.FogExp2('#1a0f0a', 0.038);
    }
    // Initialize scene background explicitly to block out browser background HTML inheritance bleed 
    if (!scene.background) {
      scene.background = new THREE.Color('#1a0f0a');
    }
  }, [scene]);

  const targetColorObj = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const scrollProgress = useScrollStore.getState().scrollProgress;
    
    // Dynamic Fog Scaling
    let targetDensity = 0.038;
    let targetColor = '#1a0f0a';
    
    if (scrollProgress > 0.15 && scrollProgress <= 0.74) {
      targetDensity = 0.06; // Thick mist for underground
      targetColor = '#080505';
    } else if (scrollProgress > 0.74 && scrollProgress <= 0.85) {
      targetDensity = 0.015; // Exiting / Sea
      targetColor = '#1a3a5a'; 
    } else if (scrollProgress > 0.85 && scrollProgress <= 0.93) {
      // Stromboli: warm Mediterranean exit, NOT a white flash
      targetColor = '#1a0f0a'; // Stay in deep espresso
      targetDensity = 0.02;
    } else if (scrollProgress > 0.93) {
      // The Page Turn Ending: fog thickens to a deep vintage brown cliffhanger
      targetColor = '#1f1008'; // Vintage dark brown
      targetDensity = 0.02 + ((scrollProgress - 0.93) / 0.07) * 0.15; // Gentle ramp, not explosive
    }

    targetColorObj.set(targetColor);

    if (scene.fog) {
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, targetDensity, 0.05);
      scene.fog.color.lerp(targetColorObj, 0.05);
    }
    if (scene.background) {
      scene.background.lerp(targetColorObj, 0.05);
    }
  });

  return null;
}
